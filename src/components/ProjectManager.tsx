import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Project } from '../types';
import { FolderGit2, Plus, Save, CheckCircle2 } from 'lucide-react';

export default function ProjectManager() {
  const { projects, activeProjectId, addProject, updateProject, setActiveProjectId } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const [formData, setFormData] = useState<Project>(activeProject || {
    id: crypto.randomUUID(),
    name: '', summary: '', objectives: '', targetImpact: '', technologyArea: '', teamMembers: '', trlLevel: '', additionalNotes: ''
  });

  const handleCreateNew = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: 'New Project', summary: '', objectives: '', targetImpact: '', technologyArea: '', teamMembers: '', trlLevel: '', additionalNotes: ''
    };
    setFormData(newProject);
    setIsEditing(true);
  };

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    const proj = projects.find(p => p.id === id);
    if (proj) {
      setFormData(proj);
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsSaved(false);
  };

  const handleSave = () => {
    if (projects.some(p => p.id === formData.id)) {
      updateProject(formData);
    } else {
      addProject(formData);
    }
    setIsSaved(true);
    setIsEditing(false);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">My Projects</h2>
          <p className="text-gray-500 mt-2">Manage your projects to provide context for grant proposals.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Projects</h3>
          {projects.length === 0 ? (
            <div className="p-6 bg-white rounded-xl border border-gray-200 border-dashed text-center text-gray-500 text-sm">
              No projects yet. Create one to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map(proj => (
                <button
                  key={proj.id}
                  onClick={() => handleSelectProject(proj.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors flex items-center space-x-3 ${
                    activeProjectId === proj.id
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FolderGit2 className={`w-5 h-5 ${activeProjectId === proj.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span className="font-medium truncate">{proj.name || 'Untitled Project'}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Project Editor */}
        <div className="lg:col-span-2">
          {(activeProject || isEditing) ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Project Details</h3>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
                    Edit
                  </button>
                ) : (
                  <button onClick={handleSave} className="flex items-center space-x-1 text-sm text-emerald-600 font-medium hover:text-emerald-700">
                    {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                )}
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border disabled:bg-gray-50 disabled:text-gray-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                  <textarea name="summary" value={formData.summary} onChange={handleChange} disabled={!isEditing} rows={3} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border disabled:bg-gray-50 disabled:text-gray-500" placeholder="Brief overview of the project..."></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Technology Area</label>
                    <input type="text" name="technologyArea" value={formData.technologyArea} onChange={handleChange} disabled={!isEditing} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border disabled:bg-gray-50 disabled:text-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">TRL Level</label>
                    <select name="trlLevel" value={formData.trlLevel} onChange={handleChange} disabled={!isEditing} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border disabled:bg-gray-50 disabled:text-gray-500">
                      <option value="">Select...</option>
                      <option value="TRL 1">TRL 1 - Basic principles observed</option>
                      <option value="TRL 2">TRL 2 - Technology concept formulated</option>
                      <option value="TRL 3">TRL 3 - Experimental proof of concept</option>
                      <option value="TRL 4">TRL 4 - Technology validated in lab</option>
                      <option value="TRL 5">TRL 5 - Technology validated in relevant environment</option>
                      <option value="TRL 6">TRL 6 - Technology demonstrated in relevant environment</option>
                      <option value="TRL 7">TRL 7 - System prototype demonstration in operational environment</option>
                      <option value="TRL 8">TRL 8 - System complete and qualified</option>
                      <option value="TRL 9">TRL 9 - Actual system proven in operational environment</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Objectives</label>
                  <textarea name="objectives" value={formData.objectives} onChange={handleChange} disabled={!isEditing} rows={3} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border disabled:bg-gray-50 disabled:text-gray-500"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Impact</label>
                  <textarea name="targetImpact" value={formData.targetImpact} onChange={handleChange} disabled={!isEditing} rows={3} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border disabled:bg-gray-50 disabled:text-gray-500"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>
                  <input type="text" name="teamMembers" value={formData.teamMembers} onChange={handleChange} disabled={!isEditing} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border disabled:bg-gray-50 disabled:text-gray-500" placeholder="Names and roles..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                  <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleChange} disabled={!isEditing} rows={2} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border disabled:bg-gray-50 disabled:text-gray-500"></textarea>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
              <div className="text-center">
                <FolderGit2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Project Selected</h3>
                <p className="text-gray-500 mt-1">Select a project from the list or create a new one.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
