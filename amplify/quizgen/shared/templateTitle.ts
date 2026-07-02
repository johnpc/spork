/** Human title from a template slug ("world-countries" → "World Countries").
 * Pure — shared by the template generation paths. */
export function titleFor(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
