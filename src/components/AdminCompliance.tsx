import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateAdminPlan } from '../services/agentService';
import { ShieldCheck, Loader2, Calendar, FileText, CheckCircle2, Circle } from 'lucide-react';

export default function AdminCompliance() {
  const { grants, adminPlans, addAdminPlan, projects, activeProjectId } = useAppContext();
  const [selectedGrantId, setSelectedGrantId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedGrant = grants.find(g => g.id === selectedGrantId);
  const adminPlan = selectedGrantId ? adminPlans[selectedGrantId] : null;
  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const handleGenerate = async () => {
    if (!selectedGrant) return;
    setIsGenerating(true);
    try {
      const plan = await generateAdminPlan(selectedGrant, activeProject);
      addAdminPlan(plan);
    } catch (err) {
      console.error(err);
      alert('Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Admin & Compliance</h2>
        <p className="text-gray-500 mt-2">Grant Administration Assistant Agent</p>
      </header>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a Grant to Manage</label>
        <div className="flex space-x-4">
          <select 
            className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
            value={selectedGrantId}
            onChange={(e) => setSelectedGrantId(e.target.value)}
          >
            <option value="">-- Select a Grant --</option>
            {grants.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <button
            onClick={handleGenerate}
            disabled={!selectedGrantId || isGenerating}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            <span>Generate Plan</span>
          </button>
        </div>
      </div>

      {adminPlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Task Timeline</h3>
            </div>
            <div className="p-0">
              <ul className="divide-y divide-gray-100">
                {adminPlan.tasks.map((task, i) => (
                  <li key={i} className="p-4 flex items-start space-x-3 hover:bg-gray-50">
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {task.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Deadline: {task.deadline}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Required Documents</h3>
            </div>
            <div className="p-0">
              <ul className="divide-y divide-gray-100">
                {adminPlan.documents.map((doc, i) => (
                  <li key={i} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      doc.status === 'finalized' ? 'bg-emerald-100 text-emerald-800' :
                      doc.status === 'drafted' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {doc.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
