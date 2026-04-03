import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { draftProposal, createProposalChat } from '../services/agentService';
import { PenTool, Loader2, Send, MessageSquare, ToggleLeft, ToggleRight, Plus, X, Save } from 'lucide-react';
import Markdown from 'react-markdown';
import { Project } from '../types';

export default function ProposalStudio() {
  const { grants, evaluations, proposals, addProposal, projects, activeProjectId, userProfile, updateProject, addProject, setActiveProjectId, proposalChats, updateProposalChat } = useAppContext();
  const [selectedGrantId, setSelectedGrantId] = useState<string>('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [useProjectContext, setUseProjectContext] = useState(true);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectFormData, setProjectFormData] = useState<Project | null>(null);
  const chatInstanceRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedGrant = grants.find(g => g.id === selectedGrantId);
  const evaluation = selectedGrantId ? evaluations[selectedGrantId] : null;
  const proposal = selectedGrantId ? proposals[selectedGrantId] : null;
  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    // Re-initialize chat when context changes
    if (selectedGrantId) {
      const history = proposalChats[selectedGrantId] || [];
      chatInstanceRef.current = createProposalChat(
        selectedGrant || null,
        evaluation || null,
        useProjectContext ? activeProject : null,
        userProfile,
        history
      );
      setChatMessages(history);
    }
  }, [selectedGrantId, useProjectContext, activeProject, userProfile]);

  useEffect(() => {
    if (selectedGrantId && chatMessages.length > 0) {
      updateProposalChat(selectedGrantId, chatMessages);
    }
  }, [chatMessages, selectedGrantId]);

  const handleDraft = async () => {
    if (!selectedGrant) return;
    setIsDrafting(true);
    try {
      const draft = await draftProposal(selectedGrant, evaluation || null, useProjectContext ? activeProject : null);
      addProposal(selectedGrant.id, draft);
    } catch (err) {
      console.error(err);
      alert('Drafting failed.');
    } finally {
      setIsDrafting(false);
    }
  };

  const handleOpenProjectForm = () => {
    if (activeProject) {
      setProjectFormData(activeProject);
    } else {
      setProjectFormData({
        id: crypto.randomUUID(),
        name: '', summary: '', objectives: '', targetImpact: '', technologyArea: '', teamMembers: '', trlLevel: '', additionalNotes: ''
      });
    }
    setShowProjectForm(true);
  };

  const handleSaveProjectForm = () => {
    if (projectFormData) {
      if (projects.some(p => p.id === projectFormData.id)) {
        updateProject(projectFormData);
      } else {
        addProject(projectFormData);
        setActiveProjectId(projectFormData.id);
      }
    }
    setShowProjectForm(false);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !chatInstanceRef.current) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatting(true);

    try {
      let response = await chatInstanceRef.current.sendMessage({ message: userMsg });
      
      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        if (call.name === 'saveProject') {
          const args = call.args as any;
          const newProject: Project = {
            id: activeProjectId || crypto.randomUUID(),
            name: args.name || '',
            summary: args.summary || '',
            objectives: args.objectives || '',
            targetImpact: args.targetImpact || '',
            technologyArea: args.technologyArea || '',
            teamMembers: args.teamMembers || '',
            trlLevel: args.trlLevel || '',
            additionalNotes: args.additionalNotes || ''
          };
          
          if (activeProjectId && projects.some(p => p.id === activeProjectId)) {
            updateProject(newProject);
          } else {
            addProject(newProject);
            setActiveProjectId(newProject.id);
          }

          response = await chatInstanceRef.current.sendMessage([{
            functionResponse: {
              name: 'saveProject',
              response: { status: 'success', project: newProject }
            }
          }]);
        }
      }

      setChatMessages(prev => [...prev, { role: 'model', content: response.text || '' }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 h-full flex flex-col pb-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Proposal Studio</h2>
          <p className="text-gray-500 mt-2">Grant Proposal Copywriter Agent</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            <select
              value={activeProjectId || ''}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="text-sm border-none bg-transparent focus:ring-0 text-gray-700 font-medium"
            >
              <option value="">-- Select Project --</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={handleOpenProjectForm} className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-indigo-600" title="Edit/Create Project">
              <PenTool className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-sm font-medium text-gray-700">Use My Project Context</span>
            <button onClick={() => setUseProjectContext(!useProjectContext)} className="text-indigo-600">
              {useProjectContext ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
            </button>
          </div>
        </div>
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

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
        {/* Proposal Document */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
            <h3 className="font-semibold text-gray-700">Generated Proposal Draft</h3>
            <span className="text-xs text-gray-500">Markdown Format</span>
          </div>
          <div className="p-8 overflow-auto flex-1 prose prose-indigo max-w-none">
            {proposal ? (
              <Markdown>{proposal}</Markdown>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Generate a draft or ask the assistant to write one.
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-2 shrink-0">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-700">Studio Assistant</h3>
          </div>
          
          <div className="flex-1 overflow-auto p-4 space-y-4 bg-gray-50/50">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                <MessageSquare className="w-8 h-8" />
                <p className="text-sm">Ask me to rewrite sections, brainstorm ideas, or review requirements.</p>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                  }`}>
                    <div className={msg.role === 'user' ? 'prose-invert' : 'prose-sm'}>
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isChatting && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 bg-white shrink-0">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={selectedGrantId ? "Ask the assistant or describe your project..." : "Select a grant first..."}
                disabled={!selectedGrantId || isChatting}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border disabled:bg-gray-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!selectedGrantId || !chatInput.trim() || isChatting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showProjectForm && projectFormData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
              <button onClick={() => setShowProjectForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input type="text" value={projectFormData.name} onChange={e => setProjectFormData({...projectFormData, name: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <textarea value={projectFormData.summary} onChange={e => setProjectFormData({...projectFormData, summary: e.target.value})} rows={3} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technology Area</label>
                  <input type="text" value={projectFormData.technologyArea} onChange={e => setProjectFormData({...projectFormData, technologyArea: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TRL Level</label>
                  <input type="text" value={projectFormData.trlLevel} onChange={e => setProjectFormData({...projectFormData, trlLevel: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objectives</label>
                <textarea value={projectFormData.objectives} onChange={e => setProjectFormData({...projectFormData, objectives: e.target.value})} rows={2} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Impact</label>
                <textarea value={projectFormData.targetImpact} onChange={e => setProjectFormData({...projectFormData, targetImpact: e.target.value})} rows={2} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>
                <input type="text" value={projectFormData.teamMembers} onChange={e => setProjectFormData({...projectFormData, teamMembers: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea value={projectFormData.additionalNotes} onChange={e => setProjectFormData({...projectFormData, additionalNotes: e.target.value})} rows={2} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"></textarea>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button onClick={() => setShowProjectForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveProjectForm} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Save Project</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
