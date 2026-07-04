import { formatClock } from './tickTimer';
import { scorePercent } from './scoreState';

interface PlayHudProps {
  remaining: number;
  found: number;
  total: number;
  /** The day's map region (e.g. "Africa" / "World") — shown for map games only. */
  region?: string | null;
}

/** Mode-shared heads-up display: countdown clock + found/total + percent (+ the
 * day's region for map games). Every renderer sits under this same HUD — it reads
 * only the engine's score/timer. */
export function PlayHud({ remaining, found, total, region }: PlayHudProps) {
  return (
    <div className="play-hud" data-testid="play-hud">
      <span className="play-hud__clock" data-testid="play-clock">
        {formatClock(remaining)}
      </span>
      {region && (
        <span className="play-hud__region" data-testid="play-region">
          {region}
        </span>
      )}
      {/* Announce score changes to screen readers as answers land — the clock is
          NOT live (it would spam AT every second). */}
      <span
        className="play-hud__score"
        data-testid="play-score"
        aria-live="polite"
        aria-label={`${found} of ${total} found`}
      >
        {found} / {total}
      </span>
      <span className="sp-muted play-hud__pct">{scorePercent(found, total)}%</span>
    </div>
  );
}
