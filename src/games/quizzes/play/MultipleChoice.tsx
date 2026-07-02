import { useMemo } from 'react';
import type { RendererProps } from './renderers';
import { parseOptions, currentQuestion, isCorrectOption } from './mcQuestion';
import './mcQuestion.css';

/**
 * MULTIPLE_CHOICE renderer — a PICK/MEMBERSHIP mode. One question at a time: the
 * current question is the first answer not yet in the engine's found set; its
 * `options` are shown as buttons. Clicking the CORRECT option (the answer's
 * `display`) calls attempt(answer.id) to score and advance to the next question.
 * A wrong click is a no-op miss. Reads only { answers, found, attempt } — the
 * shared renderer contract — so the engine stays mode-agnostic.
 */
export function MultipleChoice({ answers, found, attempt }: RendererProps) {
  const question = useMemo(() => currentQuestion(answers, found), [answers, found]);
  const options = useMemo(() => (question ? parseOptions(question.options) : []), [question]);

  if (!question) {
    return (
      <div className="mc" data-testid="multiple-choice">
        <p className="sp-muted" data-testid="mc-complete">
          All questions answered!
        </p>
      </div>
    );
  }

  return (
    <div className="mc" data-testid="multiple-choice">
      <p className="sp-heading mc__question" data-testid="mc-question">
        {question.promptValue ?? question.display}
      </p>
      <div className="mc__options">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className="mc__option"
            data-testid="mc-option"
            onClick={() => {
              if (isCorrectOption(question, option)) attempt(question.id);
            }}
          >
            {option}
          </button>
        ))}
      </div>
      <p className="sp-muted mc__found" data-testid="mc-found">
        {found.size} answered
      </p>
    </div>
  );
}
