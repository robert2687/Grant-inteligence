import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { draftProposal, createProposalChat } from '../services/agentService';
import { PenTool, Loader2, Send, MessageSquare, ToggleLeft, ToggleRight } from 'lucide-react';
import Markdown from 'react-markdown';

export default function ProposalStudio() {
  const { grants, evaluations, proposals, addProposal, projects, activeProjectId, userProfile } = useAppContext();
  const [selectedGrantId, setSelectedGrantId] = useState<string>('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [useProjectContext, setUseProjectContext] = useState(true);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
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
      chatInstanceRef.current = createProposalChat(
        selectedGrant || null,
        evaluation || null,
        useProjectContext ? activeProject : null,
        userProfile
      );
      setChatMessages([]);
    }
  }, [selectedGrantId, useProjectContext, activeProject, userProfile]);

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

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !chatInstanceRef.current) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatting(true);

    try {
      const response = await chatInstanceRef.current.sendMessage({ message: userMsg });
      setChatMessages(prev => [...prev, { role: 'assistant', content: response.text || '' }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
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
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-700">Use My Project Context</span>
          <button onClick={() => setUseProjectContext(!useProjectContext)} className="text-indigo-600">
            {useProjectContext ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
          </button>
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
                placeholder={selectedGrantId ? "Ask the assistant..." : "Select a grant first..."}
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
    </div>
  );
}
