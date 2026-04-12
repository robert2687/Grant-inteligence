import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AppProvider, useAppContext } from './AppContext';
import { UserProfile, Project, Grant, Evaluation, AdminData } from '../types';

const TestConsumer = () => {
  const {
    userProfile,
    projects,
    activeProjectId,
    grants,
    evaluations,
    proposals,
    adminPlans,
    proposalChats,
    updateUserProfile,
    addProject,
    updateProject,
    setActiveProjectId,
    addGrants,
    updateGrantStatus,
    addEvaluation,
    addProposal,
    addAdminPlan,
    updateProposalChat,
  } = useAppContext();

  return (
    <div>
      <div data-testid="userProfile">{userProfile ? userProfile.name : 'null'}</div>
      <div data-testid="projects-count">{projects.length}</div>
      <div data-testid="activeProjectId">{activeProjectId || 'null'}</div>
      <div data-testid="grants-count">{grants.length}</div>
      <div data-testid="evaluations-count">{Object.keys(evaluations).length}</div>
      <div data-testid="proposals-count">{Object.keys(proposals).length}</div>
      <div data-testid="adminPlans-count">{Object.keys(adminPlans).length}</div>
      <div data-testid="proposalChats-count">{Object.keys(proposalChats).length}</div>

      <button onClick={() => updateUserProfile({ name: 'Alice', expertise: [], interests: [] })}>Update User Profile</button>
      <button onClick={() => addProject({ id: 'p1', name: 'Project 1', description: '' })}>Add Project</button>
      <button onClick={() => updateProject({ id: 'p1', name: 'Updated Project 1', description: '' })}>Update Project</button>
      <button onClick={() => setActiveProjectId('p1')}>Set Active Project</button>
      <button onClick={() => addGrants([{ id: 'g1', title: 'Grant 1', description: '', amount: 1000, deadline: '', status: 'new' }])}>Add Grants</button>
      <button onClick={() => updateGrantStatus('g1', 'evaluating')}>Update Grant Status</button>
      <button onClick={() => addEvaluation({ grantId: 'g1', score: 95, comments: 'Good', strengths: [], weaknesses: [], recommendations: [] })}>Add Evaluation</button>
      <button onClick={() => addProposal('g1', 'My Proposal')}>Add Proposal</button>
      <button onClick={() => addAdminPlan({ grantId: 'g1', plan: 'My Plan', schedule: [], resources: [] })}>Add Admin Plan</button>
      <button onClick={() => updateProposalChat('g1', [{ role: 'user', content: 'Hello' }])}>Update Proposal Chat</button>
    </div>
  );
};

describe('AppProvider', () => {
  it('provides initial state and allows state updates via context methods', () => {
    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );

    // Check initial state
    expect(screen.getByTestId('userProfile').textContent).toBe('null');
    expect(screen.getByTestId('projects-count').textContent).toBe('0');
    expect(screen.getByTestId('activeProjectId').textContent).toBe('null');
    expect(screen.getByTestId('grants-count').textContent).toBe('0');
    expect(screen.getByTestId('evaluations-count').textContent).toBe('0');
    expect(screen.getByTestId('proposals-count').textContent).toBe('0');
    expect(screen.getByTestId('adminPlans-count').textContent).toBe('0');
    expect(screen.getByTestId('proposalChats-count').textContent).toBe('0');

    // Update User Profile
    act(() => {
      screen.getByText('Update User Profile').click();
    });
    expect(screen.getByTestId('userProfile').textContent).toBe('Alice');

    // Add Project
    act(() => {
      screen.getByText('Add Project').click();
    });
    expect(screen.getByTestId('projects-count').textContent).toBe('1');
    expect(screen.getByTestId('activeProjectId').textContent).toBe('p1'); // Automatically set if no active project

    // Update Project
    act(() => {
      screen.getByText('Update Project').click();
    });
    // Can't easily verify update via length, but we know it doesn't crash
    expect(screen.getByTestId('projects-count').textContent).toBe('1');

    // Add Grants
    act(() => {
      screen.getByText('Add Grants').click();
    });
    expect(screen.getByTestId('grants-count').textContent).toBe('1');

    // Add Evaluation
    act(() => {
      screen.getByText('Add Evaluation').click();
    });
    expect(screen.getByTestId('evaluations-count').textContent).toBe('1');

    // Add Proposal
    act(() => {
      screen.getByText('Add Proposal').click();
    });
    expect(screen.getByTestId('proposals-count').textContent).toBe('1');

    // Add Admin Plan
    act(() => {
      screen.getByText('Add Admin Plan').click();
    });
    expect(screen.getByTestId('adminPlans-count').textContent).toBe('1');

    // Update Proposal Chat
    act(() => {
      screen.getByText('Update Proposal Chat').click();
    });
    expect(screen.getByTestId('proposalChats-count').textContent).toBe('1');
  });
});
