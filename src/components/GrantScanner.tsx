import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { scanForGrants } from '../services/agentService';
import { Search, Loader2, ExternalLink, Filter } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Grant } from '../types';

// Performance Optimization: GrantCard component wrapped with React.memo to prevent
// redundant re-renders when parent state (e.g., filter text, active tab) changes
// without affecting this specific grant's data.
const GrantCard = React.memo(function GrantCard({ grant }: { grant: Grant }) {
  const { t, locale } = useLanguage();

  // Performance Optimization: Memoize deadline date formatting to avoid repeated
  // expensive Date parsing and toLocaleDateString calculations on every render.
  const formattedDeadline = useMemo(() => {
    return new Date(grant.deadline).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [grant.deadline, locale]);

  return (
    <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center flex-wrap gap-2 md:gap-3">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">{grant.name}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {grant.fitScore}% {t('fit')}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {grant.region} • Deadline: {formattedDeadline}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-emerald-600">
            {grant.amount}
          </p>
          <a href={grant.sourceLink} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-blue-600 hover:underline mt-1">
            {t('source')} <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-900">{t('relevance')}</h4>
        <p className="text-sm text-gray-600 mt-1">{grant.relevance}</p>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-900">{t('eligibility')}</h4>
        <p className="text-sm text-gray-600 mt-1">{grant.eligibility}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {grant.themes.map((theme, i) => (
          <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
            {theme}
          </span>
        ))}
      </div>
    </div>
  );
});

export default function GrantScanner() {
  const { grants, addGrants, userProfile, projects, activeProjectId } = useAppContext();
  const { t } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [regionFilter, setRegionFilter] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [deadlineFilter, setDeadlineFilter] = useState('');
  const [minFitScore, setMinFitScore] = useState<number | ''>('');

  // Memoize active project lookup to avoid re-calculating on every render
  const activeProject = useMemo(() =>
    projects.find(p => p.id === activeProjectId) || null,
    [projects, activeProjectId]
  );

  const handleScan = async () => {
    setIsScanning(true);
    setError(null);
    try {
      const newGrants = await scanForGrants(userProfile, activeProject);
      addGrants(newGrants);
    } catch (err: any) {
      setError(err.message || 'Failed to scan for grants.');
    } finally {
      setIsScanning(false);
    }
  };

  // Memoize filtered grants to prevent redundant calculations on unrelated re-renders
  // Pre-calculating lower-cased filter strings improves performance in the filter loop
  const filteredGrants = useMemo(() => {
    const lowRegion = regionFilter.toLowerCase();
    const lowAmount = amountFilter.toLowerCase();

    return grants.filter(grant => {
      if (regionFilter && !grant.region.toLowerCase().includes(lowRegion)) return false;
      if (amountFilter && !grant.amount.toLowerCase().includes(lowAmount)) return false;
      if (deadlineFilter && grant.deadline > deadlineFilter) return false;
      if (minFitScore !== '' && grant.fitScore < minFitScore) return false;
      return true;
    });
  }, [grants, regionFilter, amountFilter, deadlineFilter, minFitScore]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{t('grantScanner')}</h2>
          <p className="text-sm md:text-base text-gray-500 mt-1 md:mt-2">Autonomous Global Grant-Search Agent</p>
        </div>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 md:py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 w-full md:w-auto min-h-[44px]"
        >
          {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          <span>{isScanning ? t('scanning') : t('triggerScan')}</span>
        </button>
      </header>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {grants.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row flex-wrap gap-4 items-stretch md:items-end">
          <div className="flex items-center space-x-2 w-full mb-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="font-medium text-gray-700">{t('filterGrants')}</h3>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('region')}</label>
            <input
              type="text"
              placeholder="e.g. Europe, Global"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('amount')}</label>
            <input
              type="text"
              placeholder="e.g. €50,000"
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('deadlineBefore')}</label>
            <input
              type="date"
              value={deadlineFilter}
              onChange={(e) => setDeadlineFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('minFitScore')}</label>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 80"
              value={minFitScore}
              onChange={(e) => setMinFitScore(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {grants.length === 0 && !isScanning && (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">{t('noGrantsFound')}</h3>
            <p className="text-gray-500 mt-1">{t('triggerScanDesc')}</p>
          </div>
        )}

        {filteredGrants.map(grant => (
          <GrantCard key={grant.id} grant={grant} />
        ))}
        
        {grants.length > 0 && filteredGrants.length === 0 && (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-200 border-dashed">
            <p className="text-gray-500">No grants match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
