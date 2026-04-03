import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { draftProposal } from '../services/agentService';
import { PenTool, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

export default function ProposalStudio() {
  const { grants, evaluations, proposals, addProposal } = useAppContext();
  const [selectedGrantId, setSelectedGrantId] = useState<string>('');
  const [isDrafting, setIsDrafting] = useState(false);

  const selectedGrant = grants.find(g => g.id === selectedGrantId);
  const evaluation = selectedGrantId ? evaluations[selectedGrantId] : null;
  const proposal = selectedGrantId ? proposals[selectedGrantId] : null;

  const handleDraft = async () => {
    if (!selectedGrant) return;
    setIsDrafting(true);
    try {
      const draft = await draftProposal(selectedGrant, evaluation || null);
      addProposal(selectedGrant.id, draft);
    } catch (err) {
      console.error(err);
      alert('Drafting failed.');
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 h-full flex flex-col">
      <header>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Proposal Studio</h2>
        <p className="text-gray-500 mt-2">Grant Proposal Copywriter Agent</p>
      </header>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm shrink-0">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a Grant to Draft</label>
        <div className="flex space-x-4">
          <select 
            className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
            value={selectedGrantId}
            onChange={(e) => setSelectedGrantId(e.target.value)}
          >
            <option value="">-- Select a Grant --</option>
            {grants.map(g => (
              <option key={g.id} value={g.id}>{g.name} {evaluations[g.id]?.decision === 'Go' ? '(GO)' : ''}</option>
            ))}
          </select>
          <button
            onClick={handleDraft}
            disabled={!selectedGrantId || isDrafting}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isDrafting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PenTool className="w-5 h-5" />}
            <span>Generate Draft</span>
          </button>
        </div>
      </div>

      {proposal && (
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Generated Proposal Draft</h3>
            <span className="text-xs text-gray-500">Markdown Format</span>
          </div>
          <div className="p-8 overflow-auto flex-1 prose prose-indigo max-w-none">
            <Markdown>{proposal}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}
