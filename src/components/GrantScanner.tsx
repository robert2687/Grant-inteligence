import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { scanForGrants } from '../services/agentService';
import { Search, Loader2, ExternalLink } from 'lucide-react';

export default function GrantScanner() {
  const { grants, addGrants, userProfile, projects, activeProjectId } = useAppContext();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Grant Scanner</h2>
          <p className="text-gray-500 mt-2">Autonomous Global Grant-Search Agent</p>
        </div>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          <span>{isScanning ? 'Scanning Global Sources...' : 'Trigger Scan'}</span>
        </button>
      </header>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {grants.length === 0 && !isScanning && (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No grants found</h3>
            <p className="text-gray-500 mt-1">Trigger a scan to find relevant opportunities.</p>
          </div>
        )}

        {grants.map(grant => (
          <div key={grant.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-bold text-gray-900">{grant.name}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {grant.fitScore}% Fit
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{grant.region} • Deadline: {grant.deadline}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-600">{grant.amount}</p>
                <a href={grant.sourceLink} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-blue-600 hover:underline mt-1">
                  Source <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-900">Relevance</h4>
              <p className="text-sm text-gray-600 mt-1">{grant.relevance}</p>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-900">Eligibility</h4>
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
        ))}
      </div>
    </div>
  );
}
