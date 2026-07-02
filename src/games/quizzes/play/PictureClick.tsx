import { useMemo } from 'react';
import type { RendererProps } from './renderers';
import { currentTarget, promptText, hotspotRole, hotspotClass } from './pictureClickModel';
import './pictureClick.css';

/**
 * PICTURE_CLICK renderer — click the right spot on a single labeled image given
 * a prompt (e.g. "Click the top-left quadrant"). Each REGION answer is a hotspot
 * keyed by its promptValue; the active prompt names one target and clicking its
 * hotspot calls attempt(answer.id) (MEMBERSHIP scoring). For the seed the image
 * is a simple 2x2 grid of colored quadrant divs (data-hotspot ids). It consumes
 * only the RendererProps contract — no renderConfig needed, the answers ARE the
 * hotspots — so the engine stays mode-agnostic.
 */
export function PictureClick({ answers, found, attempt }: RendererProps) {
  const regions = useMemo(() => answers.filter((a) => a.promptKind === 'REGION'), [answers]);
  const target = useMemo(() => currentTarget(regions, found), [regions, found]);

  return (
    <div className="pc" data-testid="picture-click">
      <p className="sp-kicker pc__prompt" data-testid="pc-prompt">
        {promptText(target)}
      </p>
      <div className="pc__image" data-testid="pc-image">
        {regions.map((a) => {
          const role = hotspotRole(a, found, target);
          return (
            <button
              key={a.id}
              type="button"
              className={hotspotClass(role)}
              data-hotspot={a.promptValue ?? a.id}
              data-testid={role === 'found' ? 'pc-found' : 'pc-hotspot'}
              aria-label={a.display}
              disabled={role === 'found'}
              onClick={() => attempt(a.id)}
            >
              <span className="pc-hotspot__label">{role === 'found' ? a.display : ''}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
