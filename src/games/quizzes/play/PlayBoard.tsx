import { Suspense, type ComponentType } from 'react';
import type { RendererProps } from './renderers';
import { PlayHud } from './PlayHud';
import { PlayControls } from './PlayControls';
import { Skeleton } from '../../../features/shell/Skeleton';

interface PlayBoardProps {
  p: ReturnType<typeof import('./usePlay').usePlay>;
  Renderer: ComponentType<RendererProps>;
  typed: boolean;
  hint: string;
  best: number | null;
}

/** The active play surface: the shared HUD, the how-to-play hint, the mode's
 * renderer (lazy → Suspense), and the below-board controls. Extracted so Play
 * stays a thin page shell (header + load/redirect gating). */
export function PlayBoard({ p, Renderer, typed, hint, best }: PlayBoardProps) {
  return (
    <div className="play">
      <PlayHud
        remaining={p.remaining}
        found={p.score.found}
        total={p.score.total}
        region={p.regionLabel}
      />
      {hint && (
        <p className="sp-muted play__hint" data-testid="play-hint">
          {hint}
        </p>
      )}
      <Suspense fallback={<Skeleton height="20rem" radius="var(--sp-radius)" />}>
        <Renderer
          answers={p.answers}
          found={p.found}
          attempt={p.attempt}
          status={p.status}
          renderConfig={p.renderConfig}
        />
      </Suspense>
      <PlayControls
        status={p.status}
        typed={typed}
        best={best}
        score={p.score}
        timeSeconds={p.timeSeconds}
        submit={p.submit}
        start={p.start}
        giveUp={p.giveUp}
      />
    </div>
  );
}
