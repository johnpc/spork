/** Hand-authored World Capitals quiz (static, well-known data — no AI). A
 * SLIDESHOW: each slide's prompt is a country, the answer is its capital. DATA
 * (gate-exempt). Keyed by the topic "World Capitals" (see gameCatalog
 * topicFilter). A curated set of widely-known countries — not exhaustive. */
import type { QuizFixture, AnswerFixture } from './types';

const CAPITALS: [country: string, capital: string, alt?: string[]][] = [
  ['France', 'Paris'],
  ['Japan', 'Tokyo'],
  ['Egypt', 'Cairo'],
  ['Brazil', 'Brasília', ['Brasilia']],
  ['Canada', 'Ottawa'],
  ['Australia', 'Canberra'],
  ['Germany', 'Berlin'],
  ['Italy', 'Rome'],
  ['Spain', 'Madrid'],
  ['Russia', 'Moscow'],
  ['China', 'Beijing', ['Peking']],
  ['India', 'New Delhi', ['Delhi']],
  ['Mexico', 'Mexico City'],
  ['Argentina', 'Buenos Aires'],
  ['South Africa', 'Pretoria'],
  ['Kenya', 'Nairobi'],
  ['Nigeria', 'Abuja'],
  ['Greece', 'Athens'],
  ['Portugal', 'Lisbon'],
  ['Netherlands', 'Amsterdam'],
  ['Sweden', 'Stockholm'],
  ['Norway', 'Oslo'],
  ['Poland', 'Warsaw'],
  ['Turkey', 'Ankara'],
  ['Thailand', 'Bangkok'],
  ['South Korea', 'Seoul'],
  ['Vietnam', 'Hanoi'],
  ['Peru', 'Lima'],
  ['Chile', 'Santiago'],
  ['Cuba', 'Havana'],
  ['Ireland', 'Dublin'],
  ['Austria', 'Vienna'],
  ['Switzerland', 'Bern', ['Berne']],
  ['Iceland', 'Reykjavik', ['Reykjavík']],
  ['New Zealand', 'Wellington'],
];

const answers: AnswerFixture[] = CAPITALS.map(([country, capital, alt = []]) => ({
  display: capital,
  accepted: [capital, ...alt],
  promptKind: 'TEXT',
  promptValue: country,
}));

export const worldCapitalsQuiz: QuizFixture = {
  topic: 'World Capitals',
  categorySlug: 'geography',
  description: 'Name the capital of each country.',
  mode: 'SLIDESHOW',
  inputMode: 'TYPE',
  scoringMode: 'MEMBERSHIP',
  timeLimitSeconds: 300,
  answers,
};
