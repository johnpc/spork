/** The chain of words played so far, start → current, with the target marked
 * once reached. A word is highlighted when it equals the target. */
export function LadderPath({ path, target }: { path: string[]; target: string }) {
  return (
    <ol className="ladder-path" data-testid="ladder-path">
      {path.map((word, i) => (
        <li
          key={`${word}-${i}`}
          className={
            word === target ? 'ladder-path__word ladder-path__word--target' : 'ladder-path__word'
          }
          data-testid="ladder-word"
        >
          {word.toUpperCase()}
        </li>
      ))}
    </ol>
  );
}
