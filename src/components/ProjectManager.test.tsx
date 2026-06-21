import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectManager from './ProjectManager';
import { useAppContext } from '../context/AppContext';

vi.mock('../context/AppContext', () => ({
  useAppContext: vi.fn(),
}));

const mockProjects = [
  { id: '1', name: 'Project 1', summary: 'Summary 1' },
  { id: '2', name: 'Project 2', summary: 'Summary 2' },
];

describe('ProjectManager', () => {
  it('renders project list and allows selection', () => {
    const setActiveProjectId = vi.fn();
    const addProject = vi.fn();
    const updateProject = vi.fn();

    (useAppContext as any).mockReturnValue({
      projects: mockProjects,
      activeProjectId: '1',
      addProject,
      updateProject,
      setActiveProjectId,
    });

    render(<ProjectManager />);

    expect(screen.getByText('Project 1')).toBeDefined();
    expect(screen.getByText('Project 2')).toBeDefined();

    const project2Button = screen.getByText('Project 2');
    fireEvent.click(project2Button);

    expect(setActiveProjectId).toHaveBeenCalledWith('2');
    // After selection, the form should show Project 2's summary
    expect(screen.getByDisplayValue('Summary 2')).toBeDefined();
  });
});
