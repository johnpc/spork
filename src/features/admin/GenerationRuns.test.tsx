import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GenerationRuns } from './GenerationRuns';
import type { GenerationRunRecord } from '../../lib/dataClient';

const run = (over: Partial<GenerationRunRecord>): GenerationRunRecord =>
  ({
    id: 'r1',
    topic: 'Spanish',
    status: 'RUNNING',
    requestedCount: 10,
    generatedCount: 0,
    ...over,
  }) as GenerationRunRecord;

describe('GenerationRuns', () => {
  it('renders nothing when there are no runs', () => {
    const { container } = render(<GenerationRuns runs={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows a generating status for a running run', () => {
    render(<GenerationRuns runs={[run({ status: 'RUNNING' })]} />);
    expect(screen.getByTestId('gen-run-status')).toHaveTextContent('Generating');
  });

  it('shows ready with the count when DRAFT_READY', () => {
    render(<GenerationRuns runs={[run({ status: 'DRAFT_READY', generatedCount: 10 })]} />);
    expect(screen.getByTestId('gen-run-status')).toHaveTextContent('Ready · 10/10');
  });

  it('shows failed for a failed run', () => {
    render(<GenerationRuns runs={[run({ status: 'FAILED' })]} />);
    expect(screen.getByTestId('gen-run-status')).toHaveTextContent('Failed');
  });
});
