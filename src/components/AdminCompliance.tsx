import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateAdminPlan } from '../services/agentService';
import { ShieldCheck, Loader2, Calendar, FileText, CheckCircle2, Circle, AlertTriangle, CheckSquare } from 'lucide-react';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-800';
    case 'in progress':
      return 'bg-amber-100 text-amber-800';
    case 'missing':
    case 'overdue':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIconColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-emerald-500';
    case 'in progress':
      return 'text-amber-500';
    case 'missing':
    case 'overdue':
      return 'text-red-500';
    default:
      return 'text-gray-300';
  }
};

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

  const isAffected = (itemName: string) => {
    return adminPlan?.alerts?.some(alert => alert.affectedItems.includes(itemName));
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
        <div className="space-y-8">
          {adminPlan.alerts && adminPlan.alerts.length > 0 && (
            <div className="space-y-4">
              {adminPlan.alerts.map((alert, i) => (
                <div key={i} className={`p-4 rounded-lg border ${
                  alert.severity === 'high' ? 'bg-red-50 border-red-200 text-red-800' :
                  alert.severity === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                  'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                      alert.severity === 'high' ? 'text-red-500' :
                      alert.severity === 'medium' ? 'text-amber-500' :
                      'text-blue-500'
                    }`} />
                    <div>
                      <h4 className="font-semibold">{alert.message}</h4>
                      <p className="text-sm mt-1 opacity-90">{alert.nextSteps}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Task Timeline</h3>
              </div>
              <div className="p-0">
                <ul className="divide-y divide-gray-100">
                  {adminPlan.tasks.map((task, i) => (
                    <li key={i} className={`p-4 flex items-start space-x-3 hover:bg-gray-50 ${isAffected(task.name) ? 'bg-red-50/50' : ''}`}>
                      {task.status === 'completed' ? (
                      <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${getStatusIconColor(task.status)}`} />
                    ) : (
                      <Circle className={`w-5 h-5 shrink-0 mt-0.5 ${getStatusIconColor(task.status)}`} />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {task.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Deadline: {task.deadline}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
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
                  <li key={i} className={`p-4 flex items-center justify-between hover:bg-gray-50 ${isAffected(doc.name) ? 'bg-red-50/50' : ''}`}>
                    <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {adminPlan.submissionReadiness && adminPlan.submissionReadiness.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Submission Readiness</h3>
              </div>
              <div className="p-0">
                <ul className="divide-y divide-gray-100">
                  {adminPlan.submissionReadiness.map((indicator, i) => (
                    <li key={i} className={`p-4 flex items-center justify-between hover:bg-gray-50 ${isAffected(indicator.indicator) ? 'bg-red-50/50' : ''}`}>
                      <span className="text-sm font-medium text-gray-900">{indicator.indicator}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(indicator.status)}`}>
                        {indicator.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {adminPlan.complianceWarnings && adminPlan.complianceWarnings.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Compliance Warnings</h3>
              </div>
              <div className="p-0">
                <ul className="divide-y divide-gray-100">
                  {adminPlan.complianceWarnings.map((warning, i) => (
                    <li key={i} className={`p-4 flex items-center justify-between hover:bg-gray-50 ${isAffected(warning.warning) ? 'bg-red-50/50' : ''}`}>
                      <span className="text-sm font-medium text-gray-900">{warning.warning}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(warning.status)}`}>
                        {warning.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
}
