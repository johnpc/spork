import { useEffect } from 'react';

const BASE = 'Spork';

/** Set the browser document title to "<page> · Spork" while this screen is
 * mounted, restoring the previous title on unmount. Improves browser history,
 * tab identification, and screen-reader page announcements per route. Pass a
 * falsy title to leave the document title untouched (e.g. while loading). */
export function useDocumentTitle(title: string | null | undefined): void {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = title === BASE ? BASE : `${title} · ${BASE}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
