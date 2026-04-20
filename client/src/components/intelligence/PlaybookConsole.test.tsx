import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlaybookConsole } from './PlaybookConsole';
import { PlaybookData } from '@/hooks/useStadiumPulse';
import React from 'react';

// Mock framer-motion to avoid animation issues in jsdom test env
vi.mock('framer-motion', () => {
  const actual = vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

describe('PlaybookConsole Component', () => {
  const mockPlaybook: PlaybookData = {
    prediction: 'High congestion predicted at North Gate.',
    simulations: 'Path 1 efficiency: 85%',
    playbook: 'Deploy 4 additional security personnel.',
  };

  it('renders empty state correctly', () => {
    render(<PlaybookConsole playbook={null} onGenerate={() => {}} isLoading={false} />);
    expect(screen.getByText(/Ready to transform raw/i)).toBeInTheDocument();
    expect(screen.getByText('Run Playbook')).toBeInTheDocument();
  });

  it('renders loading state correctly', () => {
    render(<PlaybookConsole playbook={null} onGenerate={() => {}} isLoading={true} />);
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders playbook data correctly', () => {
    render(<PlaybookConsole playbook={mockPlaybook} onGenerate={() => {}} isLoading={false} />);
    expect(screen.getByText(mockPlaybook.prediction)).toBeInTheDocument();
    expect(screen.getByText(mockPlaybook.simulations)).toBeInTheDocument();
    expect(screen.getByText(mockPlaybook.playbook)).toBeInTheDocument();
  });

  it('calls onGenerate when button is clicked', () => {
    const onGenerateMock = vi.fn();
    render(<PlaybookConsole playbook={null} onGenerate={onGenerateMock} isLoading={false} />);
    fireEvent.click(screen.getByRole('button', { name: /Run Playbook/i }));
    expect(onGenerateMock).toHaveBeenCalledTimes(1);
  });
});
