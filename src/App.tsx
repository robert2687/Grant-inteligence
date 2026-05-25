import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Dashboard from './components/Dashboard';
import GrantScanner from './components/GrantScanner';
import GrantEvaluator from './components/GrantEvaluator';
import ProposalStudio from './components/ProposalStudio';
import AdminCompliance from './components/AdminCompliance';
import UserProfile from './components/UserProfile';
import ProjectManager from './components/ProjectManager';

export type Tab = 'dashboard' | 'profile' | 'projects' | 'scanner' | 'evaluator' | 'studio' | 'admin';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <LanguageProvider>
      <AppProvider>
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans relative overflow-hidden">
          <div className="hidden md:flex h-full">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
            {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
            {activeTab === 'profile' && <UserProfile />}
            {activeTab === 'projects' && <ProjectManager />}
            {activeTab === 'scanner' && <GrantScanner />}
            {activeTab === 'evaluator' && <GrantEvaluator />}
            {activeTab === 'studio' && <ProposalStudio />}
            {activeTab === 'admin' && <AdminCompliance />}
          </main>
          <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </AppProvider>
    </LanguageProvider>
  );
}
