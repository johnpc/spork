import type { GenerationRunRecord } from '../../../lib/dataClient';

/** Recent quiz generation runs with their live status (RUNNING → DRAFT_READY /
 * FAILED). Polling in useQuizAdmin flips these without a manual refresh. */
export function QuizRuns({ runs }: { runs: GenerationRunRecord[] }) {
  if (runs.length === 0) return null;
  return (
    <ul className="quiz-runs" data-testid="quiz-runs">
      {runs.slice(0, 10).map((r) => (
        <li key={r.id} className="quiz-runs__item" data-testid="quiz-run">
          <span className="quiz-runs__topic">{r.topic}</span>
          <span
            className={`quiz-runs__status quiz-runs__status--${(r.status ?? '').toLowerCase()}`}
          >
            {r.status}
          </span>
          {r.statusReason && <span className="sp-muted quiz-runs__reason">{r.statusReason}</span>}
        </li>
      ))}
    </ul>
  );
}
