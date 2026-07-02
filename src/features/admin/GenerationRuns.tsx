import type { GenerationRunRecord } from '../../lib/dataClient';

/** Recent AI generation runs with their status. Renders only. */
export function GenerationRuns({ runs }: { runs: GenerationRunRecord[] }) {
  if (runs.length === 0) return null;
  return (
    <ul className="gen-runs" aria-label="Generation runs">
      {runs.map((r) => (
        <li key={r.id} className="gen-runs__row" data-testid="gen-run">
          <span className="gen-runs__topic">{r.topic}</span>
          <span
            className={`gen-runs__status gen-runs__status--${(r.status ?? 'RUNNING').toLowerCase()}`}
            data-testid="gen-run-status"
          >
            {r.status === 'DRAFT_READY' ? (
              `Ready · ${r.generatedCount}/${r.requestedCount}`
            ) : r.status === 'FAILED' ? (
              'Failed'
            ) : (
              <>
                <span className="gen-runs__spinner" aria-hidden="true" /> Generating…
              </>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
