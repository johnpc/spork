/** The end-of-game banner: a win count, or (on a loss) the revealed answer so
 * the player always learns the word they missed. Nothing renders while playing. */
interface WordleResultProps {
  status: 'playing' | 'won' | 'lost';
  guessCount: number;
  answer: string;
}

export function WordleResult({ status, guessCount, answer }: WordleResultProps) {
  if (status === 'won') {
    return (
      <p className="wordle__result wordle__result--won" data-testid="wordle-won" role="status">
        You won in {guessCount} guesses! 🎉
      </p>
    );
  }
  if (status === 'lost') {
    return (
      <p className="wordle__result wordle__result--lost" data-testid="wordle-lost" role="status">
        The word was <strong>{answer.toUpperCase()}</strong>
      </p>
    );
  }
  return null;
}
