/** The hidden quote, revealed word-by-word as clues are solved. Masked words
 * render as underscores; solved words show plainly. On completion the full quote
 * + author attribution appear. */
export function QuoteReveal({ words, author }: { words: string[]; author: string | null }) {
  return (
    <blockquote className="quote" data-testid="quote">
      <p className="quote__text">
        {words.map((w, i) => (
          <span key={`${w}-${i}`} className="quote__word">
            {w}{' '}
          </span>
        ))}
      </p>
      {author && (
        <footer className="quote__author" data-testid="quote-author">
          — {author}
        </footer>
      )}
    </blockquote>
  );
}
