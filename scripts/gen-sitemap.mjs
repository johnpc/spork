#!/usr/bin/env node
/**
 * Generate public/sitemap.xml + public/robots.txt from the game catalog, so
 * search engines can discover every game landing page. Indexes STABLE pages
 * only — Home, Discover, and each game's /daily/<slug> landing (Flashcards →
 * /discover). Per-puzzle play routes (/quizzes/:id/play, /chess/:id, …) are
 * excluded: they're ephemeral daily ids, not durable URLs.
 *
 * Run via `npm run gen:sitemap`; committed output is served as static assets.
 * Kept in sync with the catalog by parsing its `slug:` / `href:` entries, so a
 * new game's landing page is picked up on the next run.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const SITE = 'https://spork.jpc.io';

const catalog = readFileSync(resolve(root, 'src/games/gameCatalog.ts'), 'utf8');
// Parse each game literal so we can tell a daily game (→ /daily/<slug>) from one
// with an href override (Flashcards → /discover, NOT a /daily route). Split on
// `slug:` and, within each chunk, capture the slug and any href before the next.
const chunks = catalog.split(/slug:\s*'/).slice(1);
const paths = ['/', '/discover'];
for (const chunk of chunks) {
  const slug = chunk.match(/^([^']+)'/)?.[1];
  if (!slug) continue;
  // An href only counts if it appears before the next game's fields (a small window).
  const href = chunk.slice(0, 400).match(/href:\s*'([^']+)'/)?.[1];
  paths.push(href ?? `/daily/${slug}`);
}

const urls = [...new Set(paths)]
  .map((p) => `  <url>\n    <loc>${SITE}${p}</loc>\n    <changefreq>daily</changefreq>\n  </url>`)
  .join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

const robots = `# Spork — a stack of little brain games\nUser-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`;

writeFileSync(resolve(root, 'public/sitemap.xml'), sitemap);
writeFileSync(resolve(root, 'public/robots.txt'), robots);
console.log(`Wrote public/sitemap.xml (${[...new Set(paths)].length} urls) + public/robots.txt`);
