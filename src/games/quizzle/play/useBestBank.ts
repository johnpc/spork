import { useEffect, useState, useCallback } from 'react';
import { readBestBank, saveBestBank, type KeyValueStore } from './bestBankStore';

/** Read + persist the per-device best final bank for a quizzle. Saving happens
 * in an effect (never during render) when a session finishes; `best` reflects
 * the larger of the stored value and the just-finished bank. */
export function useBestBank(
  store: KeyValueStore,
  id: string | undefined,
  done: boolean,
  bank: number,
) {
  const read = useCallback(() => (id ? readBestBank(store, id) : null), [store, id]);
  const [best, setBest] = useState<number | null>(read);

  useEffect(() => {
    if (done && id) {
      const saved = saveBestBank(store, id, bank);
      setBest(saved);
    }
  }, [done, id, bank, store]);

  return best;
}
