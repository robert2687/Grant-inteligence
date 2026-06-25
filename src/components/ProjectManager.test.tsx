import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ProjectManager from './ProjectManager';
import { AppProvider } from '../context/AppContext';

// Helper to render with provider
const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <AppProvider>
      {ui}
    </AppProvider>
  );
};

describe('ProjectManager', () => {
  it('renders the empty state when no projects exist', () => {
    renderWithProvider(<ProjectManager />);
    expect(screen.getByText(/No projects yet/i)).toBeInTheDocument();
  });

  it('can create a new project and edit its name', async () => {
    renderWithProvider(<ProjectManager />);

    const newBtn = screen.getByText(/New Project/i);
    fireEvent.click(newBtn);

    // Using display value since labels are not linked with htmlFor
    const nameInput = screen.getByDisplayValue('New Project') as HTMLInputElement;
    expect(nameInput.value).toBe('New Project');

    fireEvent.change(nameInput, { target: { value: 'Test Project' } });
    expect(nameInput.value).toBe('Test Project');

    const saveBtn = screen.getByText(/Save/i);
    fireEvent.click(saveBtn);

    // After save, it should appear in the list
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('can select a project from the list', async () => {
    renderWithProvider(<ProjectManager />);

    // Create first project
    fireEvent.click(screen.getByText(/New Project/i));
    const nameInput1 = screen.getByDisplayValue('New Project');
    fireEvent.change(nameInput1, { target: { value: 'Project A' } });
    fireEvent.click(screen.getByText(/Save/i));

    // Create second project
    fireEvent.click(screen.getByText(/New Project/i));
    const nameInput2 = screen.getByDisplayValue('New Project');
    fireEvent.change(nameInput2, { target: { value: 'Project B' } });
    fireEvent.click(screen.getByText(/Save/i));

    // Select Project A
    const projectABtn = screen.getByText('Project A');
    fireEvent.click(projectABtn);

    expect(screen.getByDisplayValue('Project A')).toBeInTheDocument();
  });
});
