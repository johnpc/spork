import { useMemo } from 'react';
import type { RendererProps } from './renderers';
import { parseOptions, currentQuestion } from './mcQuestion';
import { useMcPick } from './useMcPick';
import './mcQuestion.css';

/**
 * MULTIPLE_CHOICE renderer — PICK/MEMBERSHIP. One question at a time (the first
 * answer not yet found); its `options` are buttons. Clicking flashes the choice
 * green (correct) or red (wrong, try again); a correct pick scores via
 * attempt(id) and advances. The first click auto-starts the game (usePlay).
 */
export function MultipleChoice({ answers, found, attempt }: RendererProps) {
  const question = useMemo(() => currentQuestion(answers, found), [answers, found]);
  const options = useMemo(() => (question ? parseOptions(question.options) : []), [question]);
  const { picked, choose, optionState } = useMcPick(question, attempt);

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
        {options.map((option) => {
          const state = optionState(option);
          return (
            <button
              key={option}
              type="button"
              className={state ? `mc__option mc__option--${state}` : 'mc__option'}
              data-testid="mc-option"
              disabled={!!picked}
              onClick={() => choose(option)}
            >
              {/* A ✓/✗ glyph so correct/wrong isn't signaled by COLOUR alone
                  (WCAG 1.4.1) — red/green is the most common colour-blindness. */}
              {state && (
                <span className="mc__mark" aria-hidden="true">
                  {state === 'correct' ? '✓' : '✗'}
                </span>
              )}
              {option}
            </button>
          );
        })}
      </div>
      <p className="sp-muted mc__found" data-testid="mc-found">
        {found.size} answered
      </p>
    </div>
  );
}
