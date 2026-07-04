import type { QuizzleQuestion } from './quizzleEngine';

/** End-of-session screen: final bank vs the starting bank, plus the best bank
 * saved on this device. Shows a review of all questions + correct answers. */
export function QuizzleDone({
  bank,
  startingBank,
  best,
  questions,
}: {
  bank: number;
  startingBank: number;
  best: number | null;
  questions: QuizzleQuestion[];
}) {
  const delta = bank - startingBank;
  const verdict =
    delta > 0
      ? 'You came out ahead! 🏆'
      : delta < 0
        ? 'The house won this time.'
        : 'You broke even.';
  return (
    <div className="quizzle__done" data-testid="quizzle-done">
      <p className="quizzle__final" data-testid="quizzle-final-bank">
        Final bank: <strong>{bank}</strong>
      </p>
      <p className="sp-muted">
        Started with {startingBank} · {delta >= 0 ? '+' : ''}
        {delta}
      </p>
      <p className="quizzle__verdict">{verdict}</p>
      {best != null && (
        <p className="sp-muted" data-testid="quizzle-best">
          Best on this device: {best}
        </p>
      )}
      {questions.length > 0 && (
        <div className="quizzle__review" data-testid="quizzle-review" role="status">
          <h3 className="sp-heading">Review</h3>
          <ol className="quizzle__review-list">
            {questions.map((q, i) => (
              <li key={i} className="quizzle__review-item">
                <p className="quizzle__review-question">{q.question}</p>
                <p className="sp-muted quizzle__review-answer">
                  Answer: <strong>{q.answer}</strong>
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
