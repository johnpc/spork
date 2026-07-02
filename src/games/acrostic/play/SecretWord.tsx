import type { WordSlot } from './acrosticEngine';

/** The hidden-word strip: one boxed letter per clue (index-aligned). A slot
 * shows its letter once its clue is solved, else a blank. On completion the
 * quote about the word is revealed beneath it. */
export function SecretWord({
  slots,
  quote,
  complete,
  author,
}: {
  slots: WordSlot[];
  quote: string;
  complete: boolean;
  author: string | null;
}) {
  return (
    <div className="secret" data-testid="secret-word">
      <div className="secret__strip">
        {slots.map((s, i) => (
          <span
            key={i}
            className={s.revealed ? 'secret__box secret__box--filled' : 'secret__box'}
            data-testid={s.revealed ? 'secret-filled' : 'secret-blank'}
          >
            {s.revealed ? s.letter : ''}
          </span>
        ))}
      </div>
      {complete && (
        <blockquote className="secret__quote" data-testid="secret-quote">
          <p>{quote}</p>
          {author && <footer data-testid="quote-author">— {author}</footer>}
        </blockquote>
      )}
    </div>
  );
}
