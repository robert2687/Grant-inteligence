import React from 'react';
import { LayoutDashboard, Search, FileCheck, PenTool, ShieldCheck, UserCircle, FolderGit2 } from 'lucide-react';
import { Tab } from '../App';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Orchestrator', icon: LayoutDashboard },
    { id: 'profile', label: 'User Profile', icon: UserCircle },
    { id: 'projects', label: 'My Projects', icon: FolderGit2 },
    { id: 'scanner', label: 'Grant Scanner', icon: Search },
    { id: 'evaluator', label: 'Evaluator', icon: FileCheck },
    { id: 'studio', label: 'Proposal Studio', icon: PenTool },
    { id: 'admin', label: 'Admin & Compliance', icon: ShieldCheck },
  ] as const;

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-indigo-600 tracking-tight">RMD26</h1>
        <p className="text-xs text-gray-500 mt-1 font-medium">Grant Intelligence System</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
