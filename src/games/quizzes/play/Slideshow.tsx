import { useMemo } from 'react';
import { deckState } from './slideshowDeck';
import type { RendererProps } from './renderers';
import './slideshow.css';

/**
 * SLIDESHOW renderer — a TYPED-input mode. The deck shows ONE slide at a time:
 * the current unfound answer's prompt (TEXT clue or IMAGE). The player types the
 * answer into the shared PlayInput, which reveals it (adds its id to `found`)
 * and advances this view to the next unfound slide. Like WorldMap, this renderer
 * ignores `attempt` and only projects the engine's found set. It reads only
 * { answers, found } from the contract and styles via --sp-* tokens.
 */
export function Slideshow({ answers, found }: RendererProps) {
  const deck = useMemo(() => deckState(answers, found), [answers, found]);
  const slide = deck.current;
  return (
    <div className="slideshow" data-testid="slideshow">
      {slide ? (
        <figure className="slideshow__slide" data-testid="slideshow-slide">
          <figcaption className="sp-kicker slideshow__progress" data-testid="slideshow-progress">
            {deck.position} / {deck.total}
          </figcaption>
          {slide.promptKind === 'IMAGE' ? (
            <img className="slideshow__image" src={slide.promptValue} alt="Slide prompt" />
          ) : (
            <p className="sp-heading slideshow__prompt">{slide.promptValue}</p>
          )}
        </figure>
      ) : (
        <p className="sp-heading slideshow__cleared" data-testid="slideshow-cleared">
          Deck cleared!
        </p>
      )}
    </div>
  );
}
