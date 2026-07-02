import { useCallback, useEffect, useState } from 'react';
import type { GenerateQuizInput } from './quizGenApi';

/** Generative modes (LLM-authored). MAP is template-backed and handled via a
 * fixed template name, so it's offered separately. */
export const GEN_MODES = [
  'CLASSIC',
  'MULTIPLE_CHOICE',
  'SLIDESHOW',
  'SORTABLE',
  'ORDER_UP',
  'PICTURE_BOX',
] as const;

/**
 * Form state for the AI generate-quiz request. `categorySlug` defaults to the
 * first real category once shelves load (never hardcoded), so a generated quiz
 * always has a shelf. `topic` is the LLM topic for generative modes.
 */
export function useQuizGenForm(
  generate: (i: GenerateQuizInput) => Promise<unknown>,
  categorySlugs: string[],
) {
  const [mode, setMode] = useState<string>('CLASSIC');
  const [topic, setTopic] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [answerCount, setAnswerCount] = useState(10);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!categorySlug && categorySlugs.length > 0) setCategorySlug(categorySlugs[0]);
  }, [categorySlug, categorySlugs]);

  const submit = useCallback(async () => {
    if (!topic.trim() || !categorySlug) return;
    setBusy(true);
    try {
      await generate({
        mode,
        topicOrTemplate: topic.trim(),
        categorySlug,
        timeLimitSeconds: 120,
        answerCount,
      });
      setTopic('');
    } finally {
      setBusy(false);
    }
  }, [mode, topic, categorySlug, answerCount, generate]);

  return {
    mode,
    setMode,
    topic,
    setTopic,
    categorySlug,
    setCategorySlug,
    answerCount,
    setAnswerCount,
    busy,
    submit,
    canSubmit: topic.trim().length > 0 && !!categorySlug && !busy,
  };
}
