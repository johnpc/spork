import type { GenerateQuizInput } from './quizGenApi';
import { useQuizGenForm, GEN_MODES } from './useQuizGenForm';
import { useShelves } from '../../../features/discover/useShelves';
import { CategorySelect } from '../../../features/admin/CategorySelect';

/** AI generate-quiz form: mode, topic, category, answer count. Renders only. */
export function GenerateQuizForm({
  onGenerate,
}: {
  onGenerate: (i: GenerateQuizInput) => Promise<unknown>;
}) {
  const { data: shelves } = useShelves();
  const f = useQuizGenForm(
    onGenerate,
    (shelves ?? []).map((s) => s.slug),
  );
  return (
    <div className="quiz-gen-form" data-testid="quiz-gen-form">
      <select aria-label="Quiz mode" value={f.mode} onChange={(e) => f.setMode(e.target.value)}>
        {GEN_MODES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <input
        className="quiz-gen-form__topic"
        placeholder="AI quiz topic, e.g. 90s One-Hit Wonders"
        aria-label="AI quiz topic"
        value={f.topic}
        onChange={(e) => f.setTopic(e.target.value)}
      />
      <CategorySelect label="Quiz category" value={f.categorySlug} onChange={f.setCategorySlug} />
      <input
        type="number"
        aria-label="Answer count"
        min={4}
        max={50}
        value={f.answerCount}
        onChange={(e) => f.setAnswerCount(Number(e.target.value))}
      />
      <button
        type="button"
        className="quiz-gen-form__btn"
        data-testid="quiz-gen-submit"
        disabled={!f.canSubmit}
        onClick={f.submit}
      >
        {f.busy ? 'Starting…' : 'Generate with AI'}
      </button>
    </div>
  );
}
