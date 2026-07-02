import { useCallback, useEffect, useState } from 'react';
import type { NewDeck } from './adminDeckApi';

/**
 * Form state for creating a deck. `categorySlug` defaults to the first REAL
 * category (passed in from the live Category rows) once they load — never a
 * hardcoded slug, so a deck can't be tagged with a non-existent category.
 */
export function useNewDeckForm(create: (d: NewDeck) => Promise<string>, categorySlugs: string[]) {
  const [topic, setTopic] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [busy, setBusy] = useState(false);

  // Adopt the first available category once they load (and if none is chosen).
  useEffect(() => {
    if (!categorySlug && categorySlugs.length > 0) setCategorySlug(categorySlugs[0]);
  }, [categorySlug, categorySlugs]);

  const submit = useCallback(async () => {
    if (!topic.trim() || !categorySlug) return;
    setBusy(true);
    try {
      await create({ topic: topic.trim(), categorySlug });
      setTopic('');
    } finally {
      setBusy(false);
    }
  }, [topic, categorySlug, create]);

  const canSubmit = topic.trim().length > 0 && !!categorySlug && !busy;
  return { topic, setTopic, categorySlug, setCategorySlug, busy, submit, canSubmit };
}
