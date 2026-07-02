import type { GenerateDeckInput } from './generateApi';
import { useGenerateForm } from './useGenerateForm';
import { useShelves } from '../discover/useShelves';
import { CategorySelect } from './CategorySelect';

const LANGUAGES = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ja-JP'];

/** AI generate-deck form: topic, category, language, card count. Renders only. */
export function GenerateDeckForm({
  onGenerate,
}: {
  onGenerate: (i: GenerateDeckInput) => Promise<unknown>;
}) {
  const { data: shelves } = useShelves();
  const f = useGenerateForm(
    onGenerate,
    (shelves ?? []).map((s) => s.slug),
  );
  return (
    <div className="generate-form" data-testid="generate-form">
      <input
        className="new-deck__input"
        placeholder="AI deck topic, e.g. Top 100 Spanish Phrases"
        aria-label="AI deck topic"
        value={f.topic}
        onChange={(e) => f.setTopic(e.target.value)}
      />
      <CategorySelect label="AI category" value={f.categorySlug} onChange={f.setCategorySlug} />
      <select
        aria-label="Voice language"
        value={f.voiceLanguage}
        onChange={(e) => f.setVoiceLanguage(e.target.value)}
      >
        {LANGUAGES.map((l) => (
          <option key={l}>{l}</option>
        ))}
      </select>
      <input
        type="number"
        aria-label="Card count"
        min={1}
        max={100}
        value={f.cardCount}
        onChange={(e) => f.setCardCount(Number(e.target.value))}
      />
      <button type="button" className="new-deck__btn" disabled={!f.canSubmit} onClick={f.submit}>
        {f.busy ? 'Starting…' : 'Generate with AI'}
      </button>
    </div>
  );
}
