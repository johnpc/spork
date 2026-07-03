import { useCallback, useState } from 'react';

/** Copy text to the clipboard, flashing a "copied" state for ~1.5s. Falls back
 * gracefully when the Clipboard API is unavailable (older/insecure contexts):
 * returns copied=false so the UI can offer the raw text instead. */
export function useCopy(): { copied: boolean; copy: (text: string) => void } {
  const [copied, setCopied] = useState(false);
  const copy = useCallback((text: string) => {
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };
    try {
      navigator.clipboard?.writeText(text).then(done, () => {});
    } catch {
      /* no clipboard — the button still shows the text via title */
    }
  }, []);
  return { copied, copy };
}
