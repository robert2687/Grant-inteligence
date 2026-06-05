import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { Grant, Evaluation, AdminData, UserProfile, Project } from '../types';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface AppState {
  userProfile: UserProfile | null;
  projects: Project[];
  activeProjectId: string | null;
  grants: Grant[];
  evaluations: Record<string, Evaluation>;
  proposals: Record<string, string>;
  adminPlans: Record<string, AdminData>;
  proposalChats: Record<string, ChatMessage[]>;
  updateUserProfile: (profile: UserProfile) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  setActiveProjectId: (id: string | null) => void;
  addGrants: (newGrants: Grant[]) => void;
  updateGrantStatus: (id: string, status: Grant['status']) => void;
  addEvaluation: (evalData: Evaluation) => void;
  addProposal: (grantId: string, proposal: string) => void;
  addAdminPlan: (adminData: AdminData) => void;
  updateProposalChat: (grantId: string, messages: ChatMessage[]) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});
  const [proposals, setProposals] = useState<Record<string, string>>({});
  const [adminPlans, setAdminPlans] = useState<Record<string, AdminData>>({});
  const [proposalChats, setProposalChats] = useState<Record<string, ChatMessage[]>>({});

  const updateUserProfile = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
  }, []);

  const addProject = useCallback((project: Project) => {
    setProjects(prev => [...prev, project]);
    if (!activeProjectId) setActiveProjectId(project.id);
  }, [activeProjectId]);

  const updateProject = useCallback((project: Project) => {
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
  }, []);

  const addGrants = useCallback((newGrants: Grant[]) => {
    setGrants(prev => {
      const existingIds = new Set(prev.map(g => g.id));
      const uniqueNew = newGrants.filter(g => !existingIds.has(g.id));
      return [...prev, ...uniqueNew];
    });
  }, []);

  const updateGrantStatus = useCallback((id: string, status: Grant['status']) => {
    setGrants(prev => prev.map(g => g.id === id ? { ...g, status } : g));
  }, []);

  const addEvaluation = useCallback((evalData: Evaluation) => {
    setEvaluations(prev => ({ ...prev, [evalData.grantId]: evalData }));
    updateGrantStatus(evalData.grantId, 'evaluating');
  }, [updateGrantStatus]);

  const addProposal = useCallback((grantId: string, proposal: string) => {
    setProposals(prev => ({ ...prev, [grantId]: proposal }));
    updateGrantStatus(grantId, 'writing');
  }, [updateGrantStatus]);

  const addAdminPlan = useCallback((adminData: AdminData) => {
    setAdminPlans(prev => ({ ...prev, [adminData.grantId]: adminData }));
  }, []);

  const updateProposalChat = useCallback((grantId: string, messages: ChatMessage[]) => {
    setProposalChats(prev => ({ ...prev, [grantId]: messages }));
  }, []);

  const value = useMemo(() => ({
    userProfile, projects, activeProjectId, grants, evaluations, proposals, adminPlans, proposalChats,
    updateUserProfile, addProject, updateProject, setActiveProjectId, addGrants, updateGrantStatus, addEvaluation, addProposal, addAdminPlan, updateProposalChat
  }), [
    userProfile, projects, activeProjectId, grants, evaluations, proposals, adminPlans, proposalChats,
    updateUserProfile, addProject, updateProject, setActiveProjectId, addGrants, updateGrantStatus, addEvaluation, addProposal, addAdminPlan, updateProposalChat
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
