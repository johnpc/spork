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
          <AnswerInput question={p.question} onAnswer={p.onAnswer} />
        </>
      )}
      {resolved && (
        <div className="quizzle__result">
          {p.lastCorrect ? (
            <p className="quizzle__result--correct" data-testid="quizzle-result">
              Correct! +{p.wagerAmount}
            </p>
          ) : (
            <div data-testid="quizzle-result">
              <p className="quizzle__result--wrong">
                Wrong — the answer was <strong>{p.question.answer}</strong>
              </p>
              <p className="sp-muted" data-testid="quizzle-answer-reveal">
                You answered: {p.lastAnswer} · -{p.wagerAmount}
              </p>
            </div>
          )}
          <button className="quizzle__btn" data-testid="quizzle-next" onClick={p.onAdvance}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
