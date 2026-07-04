import { useMemo, useState } from 'react';
import { deckState } from './slideshowDeck';
import type { RendererProps } from './renderers';
import './slideshow.css';

/**
 * SLIDESHOW renderer — a TYPED-input mode. The deck shows ONE slide at a time:
 * an unfound answer's prompt (TEXT clue or IMAGE). The player types the answer
 * into the shared PlayInput, which reveals it (adds its id to `found`). A local
 * `cursor` lets the player SKIP a prompt they don't know: skipping advances the
 * cursor to the next unfound slide WITHOUT scoring it, so it comes around again
 * (never hard-stuck on one answer). Like WorldMap, this renderer only projects
 * the engine's found set; it reads { answers, found } and styles via --sp-*.
 */
export function Slideshow({ answers, found }: RendererProps) {
  const [cursor, setCursor] = useState(0);
  const deck = useMemo(() => deckState(answers, found, cursor), [answers, found, cursor]);
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
            <p className="sp-heading slideshow__prompt" data-testid="slideshow-prompt">
              {slide.promptValue}
            </p>
          )}
          {deck.remaining > 1 && (
            <button
              type="button"
              className="slideshow__skip"
              data-testid="slideshow-skip"
              onClick={() => setCursor((c) => c + 1)}
            >
              Skip →
            </button>
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
