import React, { useState } from 'react';
import { LayoutDashboard, Search, FileCheck, PenTool, ShieldCheck, UserCircle, FolderGit2, ChevronLeft, ChevronRight, Languages } from 'lucide-react';
import { Tab } from '../App';
import { useLanguage, Locale } from '../context/LanguageContext';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { t, locale, setLocale } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('orchestrator'), icon: LayoutDashboard },
    { id: 'profile', label: t('userProfile'), icon: UserCircle },
    { id: 'projects', label: t('myProjects'), icon: FolderGit2 },
    { id: 'scanner', label: t('grantScanner'), icon: Search },
    { id: 'evaluator', label: t('evaluator'), icon: FileCheck },
    { id: 'studio', label: t('proposalStudio'), icon: PenTool },
    { id: 'admin', label: t('adminCompliance'), icon: ShieldCheck },
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
              className={`w-full flex items-center ${isOpen ? 'space-x-3 px-4' : 'justify-center px-0'} py-4 md:py-3 rounded-lg text-sm font-medium transition-colors ${
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
      <div className="p-4 border-t border-gray-200 space-y-1">
        <div className={`flex items-center ${isOpen ? 'px-4 space-x-3' : 'justify-center'} py-2`}>
          <Languages className="w-5 h-5 text-gray-400" />
          {isOpen && (
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          )}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center ${isOpen ? 'space-x-3 px-4' : 'justify-center px-0'} py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors`}
          title={isOpen ? t('hideMenu') : t('showMenu')}
        >
          {isOpen ? <ChevronLeft className="w-5 h-5 shrink-0" /> : <ChevronRight className="w-5 h-5 shrink-0" />}
          {isOpen && <span>{t('hideMenu')}</span>}
        </button>
      </div>
    </div>
  );
}
