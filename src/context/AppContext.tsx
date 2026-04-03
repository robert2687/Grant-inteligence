import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Grant, Evaluation, AdminData, UserProfile } from '../types';

interface AppState {
  userProfile: UserProfile | null;
  grants: Grant[];
  evaluations: Record<string, Evaluation>;
  proposals: Record<string, string>;
  adminPlans: Record<string, AdminData>;
  updateUserProfile: (profile: UserProfile) => void;
  addGrants: (newGrants: Grant[]) => void;
  updateGrantStatus: (id: string, status: Grant['status']) => void;
  addEvaluation: (evalData: Evaluation) => void;
  addProposal: (grantId: string, proposal: string) => void;
  addAdminPlan: (adminData: AdminData) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});
  const [proposals, setProposals] = useState<Record<string, string>>({});
  const [adminPlans, setAdminPlans] = useState<Record<string, AdminData>>({});

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const addGrants = (newGrants: Grant[]) => {
    setGrants(prev => {
      const existingIds = new Set(prev.map(g => g.id));
      const uniqueNew = newGrants.filter(g => !existingIds.has(g.id));
      return [...prev, ...uniqueNew];
    });
  };

  const updateGrantStatus = (id: string, status: Grant['status']) => {
    setGrants(prev => prev.map(g => g.id === id ? { ...g, status } : g));
  };

  const addEvaluation = (evalData: Evaluation) => {
    setEvaluations(prev => ({ ...prev, [evalData.grantId]: evalData }));
    updateGrantStatus(evalData.grantId, 'evaluating');
  };

  const addProposal = (grantId: string, proposal: string) => {
    setProposals(prev => ({ ...prev, [grantId]: proposal }));
    updateGrantStatus(grantId, 'writing');
  };

  const addAdminPlan = (adminData: AdminData) => {
    setAdminPlans(prev => ({ ...prev, [adminData.grantId]: adminData }));
  };

  return (
    <AppContext.Provider value={{ userProfile, grants, evaluations, proposals, adminPlans, updateUserProfile, addGrants, updateGrantStatus, addEvaluation, addProposal, addAdminPlan }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
