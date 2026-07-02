import type { QuizRecord } from '../../../lib/dataClient';

/** DRAFT quizzes awaiting review, each with a Play (preview) link + Publish. */
export function DraftQuizzes({
  drafts,
  onPublish,
  publishingId,
}: {
  drafts: QuizRecord[];
  onPublish: (quizId: string) => void;
  publishingId: string | null;
}) {
  if (drafts.length === 0) {
    return (
      <p className="sp-muted" data-testid="drafts-empty">
        No drafts awaiting review.
      </p>
    );
  }
  return (
    <ul className="quiz-drafts" data-testid="quiz-drafts">
      {drafts.map((q) => (
        <li key={q.id} className="quiz-drafts__item" data-testid="quiz-draft">
          <span className="quiz-drafts__topic">{q.topic}</span>
          <span className="sp-muted quiz-drafts__meta">
            {q.mode} · {q.answerCount} answers
          </span>
          <button
            type="button"
            className="quiz-drafts__publish"
            data-testid="quiz-publish"
            disabled={publishingId === q.id}
            onClick={() => onPublish(q.id)}
          >
            {publishingId === q.id ? 'Publishing…' : 'Publish'}
          </button>
        </li>
      ))}
    </ul>
  );
}
