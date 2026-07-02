import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QuizRuns } from './QuizRuns';
import type { GenerationRunRecord } from '../../../lib/dataClient';

describe('QuizRuns', () => {
  it('renders nothing when there are no runs', () => {
    const { container } = render(<QuizRuns runs={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows each run with its status + failure reason', () => {
    const runs = [
      { id: 'r1', topic: 'Capitals', status: 'DRAFT_READY' },
      { id: 'r2', topic: 'Flags', status: 'FAILED', statusReason: 'no valid answers' },
    ] as GenerationRunRecord[];
    render(<QuizRuns runs={runs} />);
    expect(screen.getByText('Capitals')).toBeInTheDocument();
    expect(screen.getByText('DRAFT_READY')).toBeInTheDocument();
    expect(screen.getByText('no valid answers')).toBeInTheDocument();
  });
});
