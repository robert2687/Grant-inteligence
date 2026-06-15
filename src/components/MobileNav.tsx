import React from 'react';
import { LayoutDashboard, Search, FileCheck, PenTool, ShieldCheck, UserCircle, FolderGit2 } from 'lucide-react';
import { Tab } from '../App';
import { useLanguage } from '../context/LanguageContext';

interface MobileNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  const { t } = useLanguage();

  // Performance: Memoize navItems to prevent redundant array instances on every render
  const navItems = React.useMemo(() => [
    { id: 'dashboard', label: t('orchestrator'), icon: LayoutDashboard },
    { id: 'profile', label: t('userProfile'), icon: UserCircle },
    { id: 'projects', label: t('myProjects'), icon: FolderGit2 },
    { id: 'scanner', label: t('grantScanner'), icon: Search },
    { id: 'evaluator', label: t('evaluator'), icon: FileCheck },
    { id: 'studio', label: t('proposalStudio'), icon: PenTool },
    { id: 'admin', label: t('adminCompliance'), icon: ShieldCheck },
  ] as const, [t]);

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
