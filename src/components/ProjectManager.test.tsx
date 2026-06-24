import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectManager from './ProjectManager';
import { useAppContext } from '../context/AppContext';
import React from 'react';

vi.mock('../context/AppContext', () => ({
  useAppContext: vi.fn(),
}));

const mockProjects = [
  { id: '1', name: 'Project 1', summary: 'Summary 1', objectives: '', targetImpact: '', technologyArea: '', teamMembers: '', trlLevel: '', additionalNotes: '' },
  { id: '2', name: 'Project 2', summary: 'Summary 2', objectives: '', targetImpact: '', technologyArea: '', teamMembers: '', trlLevel: '', additionalNotes: '' },
];

describe('ProjectManager', () => {
  it('renders project list and selects a project', () => {
    const setActiveProjectId = vi.fn();
    (useAppContext as any).mockReturnValue({
      projects: mockProjects,
      activeProjectId: '1',
      setActiveProjectId,
      addProject: vi.fn(),
      updateProject: vi.fn(),
    });

    render(<ProjectManager />);

    expect(screen.getByText('Project 1')).toBeDefined();
    expect(screen.getByText('Project 2')).toBeDefined();

    const project2Button = screen.getByText('Project 2');
    fireEvent.click(project2Button);

    expect(setActiveProjectId).toHaveBeenCalledWith('2');
  });

  it('updates form data when typing', () => {
    (useAppContext as any).mockReturnValue({
      projects: mockProjects,
      activeProjectId: '1',
      setActiveProjectId: vi.fn(),
      addProject: vi.fn(),
      updateProject: vi.fn(),
    });

    render(<ProjectManager />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Using queryByDisplayValue or similar because labels aren't linked via htmlFor
    const nameInput = screen.getByDisplayValue('Project 1') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Updated Project Name', name: 'name' } });

    expect(nameInput.value).toBe('Updated Project Name');
  });
});
