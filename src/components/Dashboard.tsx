import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Tab } from '../App';
import { Activity, Target, FileText, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard({ setActiveTab }: { setActiveTab: (tab: Tab) => void }) {
  const { grants, evaluations, proposals } = useAppContext();
  const { t } = useLanguage();

  // Performance: Use a single-pass loop instead of filter().length to avoid intermediate array allocation
  const submittedCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < grants.length; i++) {
      if (grants[i].status === 'submitted') {
        count++;
      }
    }
    return count;
  }, [grants]);

  const stats = useMemo(() => [
    { label: t('discoveredGrants'), value: grants.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: t('evaluated'), value: Object.keys(evaluations).length, icon: Target, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: t('proposalsDrafted'), value: Object.keys(proposals).length, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: t('submitted'), value: submittedCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ], [grants, evaluations, proposals, submittedCount, t]);

  // Performance: Memoize recent grants slice to prevent creating a new array on every component render
  const recentGrants = useMemo(() => grants.slice(0, 5), [grants]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('dashboardTitle')}</h2>
        <p className="text-gray-500 mt-2">{t('dashboardSubtitle')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{t('recentOpportunities')}</h3>
          <button onClick={() => setActiveTab('scanner')} className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
            {t('viewAll')}
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {recentGrants.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No grants discovered yet. Go to the Grant Scanner to start.
            </div>
          ) : (
            recentGrants.map(grant => (
              <div key={grant.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-medium text-gray-900">{grant.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{grant.region} • {grant.amount}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                    {grant.status}
                  </span>
                  <span className="text-sm font-medium text-indigo-600">{t('fit')}: {grant.fitScore}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
