import { formatClock } from './tickTimer';
import { scorePercent } from './scoreState';

interface PlayHudProps {
  remaining: number;
  found: number;
  total: number;
}

/** Mode-shared heads-up display: countdown clock + found/total + percent. Every
 * renderer sits under this same HUD — it reads only the engine's score/timer. */
export function PlayHud({ remaining, found, total }: PlayHudProps) {
  return (
    <div className="play-hud" data-testid="play-hud">
      <span className="play-hud__clock" data-testid="play-clock">
        {formatClock(remaining)}
      </span>
      <span className="play-hud__score" data-testid="play-score">
        {found} / {total}
      </span>
      <span className="sp-muted play-hud__pct">{scorePercent(found, total)}%</span>
    </div>
  );
}
