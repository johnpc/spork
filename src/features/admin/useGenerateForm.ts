import { useCallback, useEffect, useState } from 'react';
import type { GenerateDeckInput } from './generateApi';

/**
 * Form state for the AI generate-deck request. `categorySlug` defaults to the
 * first REAL category (from the live Category rows) once they load — never a
 * hardcoded slug — so a generated deck always has a shelf to surface under.
 */
export function useGenerateForm(
  generate: (i: GenerateDeckInput) => Promise<unknown>,
  categorySlugs: string[],
) {
  const [topic, setTopic] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [voiceLanguage, setVoiceLanguage] = useState('en-US');
  const [cardCount, setCardCount] = useState(10);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!categorySlug && categorySlugs.length > 0) setCategorySlug(categorySlugs[0]);
  }, [categorySlug, categorySlugs]);

  const submit = useCallback(async () => {
    if (!topic.trim() || !categorySlug) return;
    setBusy(true);
    try {
      await generate({ topic: topic.trim(), categorySlug, voiceLanguage, cardCount });
      setTopic('');
    } finally {
      setBusy(false);
    }
  }, [topic, categorySlug, voiceLanguage, cardCount, generate]);

  return {
    topic,
    setTopic,
    categorySlug,
    setCategorySlug,
    voiceLanguage,
    setVoiceLanguage,
    cardCount,
    setCardCount,
    busy,
    submit,
    canSubmit: topic.trim().length > 0 && !!categorySlug && !busy,
  };
}
