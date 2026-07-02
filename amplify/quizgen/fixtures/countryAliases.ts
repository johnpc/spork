/**
 * Curated alias overrides for the world-countries map template — DATA, not
 * logic (exempt from the file-length/coverage gates, like amplify/seed/fixtures).
 *
 * i18n-iso-countries (select:"all") already supplies official + short + alpha-2
 * + alpha-3 names for every country. This fixture only adds the informal /
 * historical / colloquial spellings a player is likely to type that the ISO
 * data omits. Keyed by ISO 3166-1 alpha-2. Values are extra accepted spellings;
 * they are normalized at index-build time on the client, so case/accents/
 * punctuation here don't matter — write them naturally.
 */
export const COUNTRY_ALIAS_OVERRIDES: Record<string, string[]> = {
  MM: ['Burma'],
  CD: ['DRC', 'DR Congo', 'Congo-Kinshasa', 'Zaire'],
  CG: ['Republic of the Congo', 'Congo-Brazzaville'],
  AE: ['UAE', 'Emirates'],
  US: ['America'],
  GB: ['Britain', 'England'], // common (if imprecise) answers players expect
  KP: ['North Korea', 'DPRK'],
  KR: ['S Korea'],
  NL: ['Holland'],
  CZ: ['Czechoslovakia'], // historical, still commonly typed
  TR: ['Turkiye'],
  SZ: ['Swaziland'], // former name of Eswatini
  MK: ['Macedonia'], // former name of North Macedonia
  TL: ['East Timor'],
  VA: ['Vatican', 'Vatican City', 'Holy See'],
  LA: ['Laos'],
  SY: ['Syria'],
  RU: ['USSR', 'Soviet Union'], // historical, commonly typed
  VN: ['Vietnam'],
  TZ: ['Tanzania'],
  BN: ['Brunei'],
  BO: ['Bolivia'],
  VE: ['Venezuela'],
  IR: ['Iran', 'Persia'],
  MD: ['Moldova'],
  FM: ['Micronesia'],
  CI: ['Ivory Coast'],
  CV: ['Cape Verde'],
  BF: ['Burkina'],
};
