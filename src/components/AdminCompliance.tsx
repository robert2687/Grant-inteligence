import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateAdminPlan } from '../services/agentService';
import { ShieldCheck, Loader2, Calendar, FileText, CheckCircle2, Circle, AlertTriangle, CheckSquare, Upload, ChevronDown, ChevronUp, Globe, Percent } from 'lucide-react';

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
  const [regionMode, setRegionMode] = useState<'EU' | 'US'>('EU');
  const [expandedTask, setExpandedTask] = useState<number | null>(null);

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

  const handleFileUpload = (docName: string) => {
    alert(`Simulating upload for: ${docName}`);
  };

  const progress = useMemo(() => {
    if (!adminPlan) return 0;
    const total = adminPlan.tasks.length + adminPlan.documents.length;
    if (total === 0) return 0;
    const completed = 
      adminPlan.tasks.filter(t => t.status === 'completed').length + 
      adminPlan.documents.filter(d => d.status === 'completed').length;
    return Math.round((completed / total) * 100);
  }, [adminPlan]);

  const readinessScore = useMemo(() => {
    if (!adminPlan || !adminPlan.submissionReadiness) return 0;
    const total = adminPlan.submissionReadiness.length;
    if (total === 0) return 0;
    const completed = adminPlan.submissionReadiness.filter(i => i.status === 'completed').length;
    return Math.round((completed / total) * 100);
  }, [adminPlan]);

  const taskSummary = useMemo(() => {
    if (!adminPlan) return { completed: 0, inProgress: 0, missing: 0, overdue: 0 };
    return adminPlan.tasks.reduce((acc, task) => {
      if (task.status === 'completed') acc.completed++;
      else if (task.status === 'in progress') acc.inProgress++;
      else if (task.status === 'missing') acc.missing++;
      else if (task.status === 'overdue') acc.overdue++;
      return acc;
    }, { completed: 0, inProgress: 0, missing: 0, overdue: 0 });
  }, [adminPlan]);

  // Filter requirements based on region mode (simulated logic)
  const filteredDocuments = useMemo(() => {
    if (!adminPlan) return [];
    if (regionMode === 'EU') {
      return adminPlan.documents.filter(d => {
        const lowerName = d.name.toLowerCase();
        return !lowerName.includes('irs') && !lowerName.includes('w9');
      });
    } else {
      return adminPlan.documents.filter(d => {
        const lowerName = d.name.toLowerCase();
        return !lowerName.includes('gdpr') && !lowerName.includes('pic');
      });
    }
  }, [adminPlan, regionMode]);

  const completedDocumentsCount = useMemo(() => {
    return filteredDocuments.reduce((count, d) => count + (d.status === 'completed' ? 1 : 0), 0);
  }, [filteredDocuments]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Admin & Compliance Dashboard</h2>
          <p className="text-gray-500 mt-2">Interactive Grant Administration & Tracking</p>
        </div>
        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <button
            onClick={() => setRegionMode('EU')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${regionMode === 'EU' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <Globe className="w-4 h-4" />
            <span>EU Mode</span>
          </button>
          <button
            onClick={() => setRegionMode('US')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${regionMode === 'US' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <Globe className="w-4 h-4" />
            <span>US Mode</span>
          </button>
        </div>
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
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Overall Progress</h3>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold text-gray-900">{progress}%</span>
                <Percent className="w-6 h-6 text-indigo-200 mb-1" />
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Submission Readiness</h3>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold text-gray-900">{readinessScore}/100</span>
                <CheckSquare className="w-6 h-6 text-emerald-200 mb-1" />
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full transition-all duration-500 ${readinessScore >= 80 ? 'bg-emerald-500' : readinessScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${readinessScore}%` }}></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Task Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-emerald-600">{taskSummary.completed}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">{taskSummary.inProgress}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">In Progress</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{taskSummary.overdue}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Overdue</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">{taskSummary.missing}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Missing</div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Panel */}
          {adminPlan.alerts && adminPlan.alerts.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Active Alerts</h3>
              </div>
              <div className="p-4 space-y-4">
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
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Timeline View */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Interactive Timeline</h3>
              </div>
              <div className="p-0">
                <ul className="divide-y divide-gray-100">
                  {adminPlan.tasks.map((task, i) => {
                    const isOverdue = task.status === 'overdue';
                    const isExpanded = expandedTask === i;
                    
                    return (
                      <li key={i} className={`flex flex-col hover:bg-gray-50 transition-colors ${isAffected(task.name) ? 'bg-red-50/30' : ''} ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
                        <div 
                          className="p-4 flex items-start space-x-3 cursor-pointer"
                          onClick={() => setExpandedTask(isExpanded ? null : i)}
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${getStatusIconColor(task.status)}`} />
                          ) : (
                            <Circle className={`w-5 h-5 shrink-0 mt-0.5 ${getStatusIconColor(task.status)}`} />
                          )}
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : isOverdue ? 'text-red-700' : 'text-gray-900'}`}>
                              {task.name}
                            </p>
                            <p className={`text-xs mt-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                              Deadline: {task.deadline}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="px-12 pb-4 pt-1 text-sm text-gray-600 bg-gray-50/50">
                            <p className="mb-2"><strong>Details:</strong> Action required to complete this step before the deadline.</p>
                            {isOverdue && <p className="text-red-600 font-medium mb-2">This task is overdue. Please prioritize.</p>}
                            <div className="flex space-x-2 mt-3">
                              <button className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 font-medium text-gray-700 transition-colors">
                                Mark Complete
                              </button>
                              <button className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 font-medium text-gray-700 transition-colors">
                                Add Note
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="space-y-8">
              {/* Document Checklist */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">Document Checklist ({regionMode})</h3>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    {completedDocumentsCount} / {filteredDocuments.length}
                  </span>
                </div>
                <div className="p-0">
                  <ul className="divide-y divide-gray-100">
                    {filteredDocuments.map((doc, i) => (
                      <li key={i} className={`p-4 flex items-center justify-between hover:bg-gray-50 ${isAffected(doc.name) ? 'bg-red-50/30' : ''}`}>
                        <div className="flex items-center space-x-3">
                          {doc.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : doc.status === 'missing' ? (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-amber-500" />
                          )}
                          <div>
                            <span className="text-sm font-medium text-gray-900 block">{doc.name}</span>
                            {doc.status === 'missing' && <span className="text-xs text-red-500">Required field missing</span>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(doc.status)}`}>
                            {doc.status}
                          </span>
                          {doc.status !== 'completed' && (
                            <button 
                              onClick={() => handleFileUpload(doc.name)}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                              title="Upload Document"
                            >
                              <Upload className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {adminPlan.complianceWarnings && adminPlan.complianceWarnings.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">Compliance Risks</h3>
                  </div>
                  <div className="p-0">
                    <ul className="divide-y divide-gray-100">
                      {adminPlan.complianceWarnings.map((warning, i) => (
                        <li key={i} className={`p-4 flex items-center justify-between hover:bg-gray-50 ${isAffected(warning.warning) ? 'bg-red-50/30' : ''}`}>
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
        </div>
      )}
    </div>
  );
}
