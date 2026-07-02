import type { QuizzleQuestion } from './quizzleEngine';
import { WagerInput } from './WagerInput';
import { AnswerInput } from './AnswerInput';

interface RoundProps {
  question: QuizzleQuestion;
  stage: 'wager' | 'answer' | 'done';
  bank: number;
  wagerAmount: number;
  lastCorrect: boolean | null;
  lastAnswer: string | null;
  onWager: (amount: number) => void;
  onAnswer: (guess: string) => void;
  onAdvance: () => void;
}

/** One question round: wager → answer → result, driven by the session stage. */
export function QuizzleRound(p: RoundProps) {
  const resolved = p.lastCorrect !== null;
  return (
    <div className="quizzle__round">
      <p className="quizzle__question" data-testid="quizzle-question">
        {p.question.question}
      </p>
      {p.stage === 'wager' && <WagerInput bank={p.bank} onWager={p.onWager} />}
      {p.stage === 'answer' && !resolved && (
        <>
          <p className="sp-muted" data-testid="quizzle-wager-amount">
            Wagering {p.wagerAmount}
          </p>
          <AnswerInput onAnswer={p.onAnswer} />
        </>
      )}
      {resolved && (
        <div className="quizzle__result">
          <p
            className={p.lastCorrect ? 'quizzle__result--correct' : 'quizzle__result--wrong'}
            data-testid="quizzle-result"
          >
            {p.lastCorrect
              ? `Correct! +${p.wagerAmount}`
              : `Wrong — ${p.lastAnswer} · -${p.wagerAmount}`}
          </p>
          <button className="quizzle__btn" data-testid="quizzle-next" onClick={p.onAdvance}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
