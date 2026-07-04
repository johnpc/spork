/**
 * Build-time generator for the continent → country grouping used by the regional
 * map rotation (Worldle / Find It). Maps each country in the world-countries map
 * fixture to a continent via a curated alpha2→continent table, then emits the
 * numeric-ISO ids per continent (matching the fixture's `promptValue`).
 *
 * Curated once here (i18n-iso-countries carries no continent data, and adding a
 * runtime dep for it isn't worth it). Regenerate with `npm run gen:continents`
 * if the map fixture's country set changes — it fails loudly on any uncategorized
 * country so the table can't silently drift out of sync.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import countries from 'i18n-iso-countries';
import { WORLD_COUNTRIES } from '../amplify/quizgen/fixtures/worldCountries';

// alpha2 → continent. Standard UN-style grouping; Russia→Europe, Turkey→Asia,
// transcontinental picks are the common quiz convention. Antarctica (AQ) and the
// French Southern Territories (TF) fold into "Antarctica" but we drop that group.
const CONTINENT: Record<string, string> = {
  // Africa
  DZ: 'Africa',
  AO: 'Africa',
  BJ: 'Africa',
  BW: 'Africa',
  BF: 'Africa',
  BI: 'Africa',
  CM: 'Africa',
  CF: 'Africa',
  TD: 'Africa',
  CG: 'Africa',
  CD: 'Africa',
  CI: 'Africa',
  DJ: 'Africa',
  EG: 'Africa',
  GQ: 'Africa',
  ER: 'Africa',
  ET: 'Africa',
  GA: 'Africa',
  GM: 'Africa',
  GH: 'Africa',
  GN: 'Africa',
  GW: 'Africa',
  KE: 'Africa',
  LS: 'Africa',
  LR: 'Africa',
  LY: 'Africa',
  MG: 'Africa',
  MW: 'Africa',
  ML: 'Africa',
  MR: 'Africa',
  MA: 'Africa',
  MZ: 'Africa',
  NA: 'Africa',
  NE: 'Africa',
  NG: 'Africa',
  RW: 'Africa',
  SN: 'Africa',
  SL: 'Africa',
  SO: 'Africa',
  ZA: 'Africa',
  SS: 'Africa',
  SD: 'Africa',
  SZ: 'Africa',
  TZ: 'Africa',
  TG: 'Africa',
  TN: 'Africa',
  UG: 'Africa',
  EH: 'Africa',
  ZM: 'Africa',
  ZW: 'Africa',
  // Europe
  AL: 'Europe',
  AT: 'Europe',
  BY: 'Europe',
  BE: 'Europe',
  BA: 'Europe',
  BG: 'Europe',
  HR: 'Europe',
  CY: 'Europe',
  CZ: 'Europe',
  DK: 'Europe',
  EE: 'Europe',
  FI: 'Europe',
  FR: 'Europe',
  DE: 'Europe',
  GR: 'Europe',
  HU: 'Europe',
  IS: 'Europe',
  IE: 'Europe',
  IT: 'Europe',
  LV: 'Europe',
  LT: 'Europe',
  LU: 'Europe',
  MD: 'Europe',
  ME: 'Europe',
  NL: 'Europe',
  MK: 'Europe',
  NO: 'Europe',
  PL: 'Europe',
  PT: 'Europe',
  RO: 'Europe',
  RU: 'Europe',
  RS: 'Europe',
  SK: 'Europe',
  SI: 'Europe',
  ES: 'Europe',
  SE: 'Europe',
  CH: 'Europe',
  UA: 'Europe',
  GB: 'Europe',
  // Asia
  AF: 'Asia',
  AM: 'Asia',
  AZ: 'Asia',
  BD: 'Asia',
  BT: 'Asia',
  BN: 'Asia',
  KH: 'Asia',
  CN: 'Asia',
  GE: 'Asia',
  IN: 'Asia',
  ID: 'Asia',
  IR: 'Asia',
  IQ: 'Asia',
  IL: 'Asia',
  JP: 'Asia',
  JO: 'Asia',
  KZ: 'Asia',
  KW: 'Asia',
  KG: 'Asia',
  LA: 'Asia',
  LB: 'Asia',
  MY: 'Asia',
  MN: 'Asia',
  MM: 'Asia',
  NP: 'Asia',
  KP: 'Asia',
  OM: 'Asia',
  PK: 'Asia',
  PS: 'Asia',
  PH: 'Asia',
  QA: 'Asia',
  SA: 'Asia',
  KR: 'Asia',
  LK: 'Asia',
  SY: 'Asia',
  TW: 'Asia',
  TJ: 'Asia',
  TH: 'Asia',
  TL: 'Asia',
  TR: 'Asia',
  TM: 'Asia',
  AE: 'Asia',
  UZ: 'Asia',
  VN: 'Asia',
  YE: 'Asia',
  // North America (incl. Central America + Caribbean)
  BS: 'North America',
  BZ: 'North America',
  CA: 'North America',
  CR: 'North America',
  CU: 'North America',
  DO: 'North America',
  SV: 'North America',
  GT: 'North America',
  HT: 'North America',
  HN: 'North America',
  JM: 'North America',
  MX: 'North America',
  NI: 'North America',
  PA: 'North America',
  PR: 'North America',
  US: 'North America',
  TT: 'North America',
  // South America
  AR: 'South America',
  BO: 'South America',
  BR: 'South America',
  CL: 'South America',
  CO: 'South America',
  EC: 'South America',
  FK: 'South America',
  GY: 'South America',
  PY: 'South America',
  PE: 'South America',
  SR: 'South America',
  UY: 'South America',
  VE: 'South America',
  // Oceania
  AU: 'Oceania',
  FJ: 'Oceania',
  NC: 'Oceania',
  NZ: 'Oceania',
  PG: 'Oceania',
  SB: 'Oceania',
  VU: 'Oceania',
  // Antarctic (dropped from the rotation — not a country-naming region)
  AQ: 'Antarctica',
  TF: 'Antarctica',
  GL: 'North America',
};

const ROTATION = ['Africa', 'Europe', 'Asia', 'North America', 'South America', 'Oceania'];

const byContinent: Record<string, string[]> = {};
const uncategorized: string[] = [];
for (const a of WORLD_COUNTRIES) {
  const a2 = countries.numericToAlpha2(a.promptValue);
  const cont = a2 ? CONTINENT[a2] : undefined;
  if (!cont) {
    uncategorized.push(`${a.promptValue} (${a.display})`);
    continue;
  }
  if (cont === 'Antarctica') continue; // not a playable region
  (byContinent[cont] ||= []).push(a.promptValue);
}

if (uncategorized.length) {
  console.error('Uncategorized countries (add to CONTINENT):', uncategorized.join(', '));
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '../src/games/quizzes/play/continents.ts');
const body = `/**
 * GENERATED by scripts/genContinents.ts — do not edit by hand. Continent →
 * numeric-ISO region ids (matching the world-countries map fixture's
 * promptValue). Drives the regional map rotation. Regenerate with
 * \`npm run gen:continents\`. DATA (gate-exempt).
 */
export const CONTINENT_ROTATION = ${JSON.stringify(ROTATION)} as const;

export const CONTINENT_REGIONS: Record<string, string[]> = ${JSON.stringify(byContinent, null, 2)};
`;
writeFileSync(out, body);
console.log(
  `Wrote ${out}: ${ROTATION.map((c) => `${c}=${byContinent[c].length}`).join(', ')} (${WORLD_COUNTRIES.length} total)`,
);
