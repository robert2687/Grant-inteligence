import React, { useState } from 'react';
import { LayoutDashboard, Search, FileCheck, PenTool, ShieldCheck, UserCircle, FolderGit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tab } from '../App';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

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
    <div className={`${isOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300 ease-in-out`}>
      <div className={`p-6 border-b border-gray-200 flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen ? (
          <div>
            <h1 className="text-xl font-bold text-indigo-600 tracking-tight">Grantit</h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">Grant Intelligence System</p>
          </div>
        ) : (
          <h1 className="text-xl font-bold text-indigo-600 tracking-tight">G</h1>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={!isOpen ? item.label : undefined}
              className={`w-full flex items-center ${isOpen ? 'space-x-3 px-4' : 'justify-center px-0'} py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
              {isOpen && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center ${isOpen ? 'space-x-3 px-4' : 'justify-center px-0'} py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors`}
          title={isOpen ? "Hide Menu" : "Show Menu"}
        >
          {isOpen ? <ChevronLeft className="w-5 h-5 shrink-0" /> : <ChevronRight className="w-5 h-5 shrink-0" />}
          {isOpen && <span>Hide Menu</span>}
        </button>
      </div>
    </div>
  );
}
