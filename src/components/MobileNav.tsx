import React, { useMemo } from 'react';
import { LayoutDashboard, Search, FileCheck, PenTool, ShieldCheck, UserCircle, FolderGit2 } from 'lucide-react';
import { Tab } from '../App';
import { useLanguage } from '../context/LanguageContext';

interface MobileNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  const { t } = useLanguage();

  const navItems = useMemo(() => [
    { id: 'dashboard' as const, label: t('orchestrator'), icon: LayoutDashboard },
    { id: 'profile' as const, label: t('userProfile'), icon: UserCircle },
    { id: 'projects' as const, label: t('myProjects'), icon: FolderGit2 },
    { id: 'scanner' as const, label: t('grantScanner'), icon: Search },
    { id: 'evaluator' as const, label: t('evaluator'), icon: FileCheck },
    { id: 'studio' as const, label: t('proposalStudio'), icon: PenTool },
    { id: 'admin' as const, label: t('adminCompliance'), icon: ShieldCheck },
  ], [t]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-20 px-2 z-50 md:hidden overflow-x-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center min-w-[64px] h-full transition-colors ${
              isActive ? 'text-indigo-600' : 'text-gray-500'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1 truncate max-w-[60px]">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
