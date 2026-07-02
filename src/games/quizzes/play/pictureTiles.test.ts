import { describe, it, expect } from 'vitest';
import { buildTiles } from './pictureTiles';
import type { AnswerRecord } from '../../../lib/dataClient';

const answers = [
  { id: 'a1', display: 'LeBron James', promptValue: '🏀' },
  { id: 'a2', display: 'Stephen Curry', promptValue: 'https://x/curry.png' },
  { id: 'a3', display: 'No Image' },
] as unknown as AnswerRecord[];

describe('buildTiles', () => {
  it('maps answers to tiles keyed by id', () => {
    const tiles = buildTiles(answers, new Set());
    expect(tiles.map((t) => t.id)).toEqual(['a1', 'a2', 'a3']);
    expect(tiles[0]).toEqual({ id: 'a1', image: '🏀', label: 'LeBron James', found: false });
  });

  it('marks tiles whose id is in the found set as revealed', () => {
    const tiles = buildTiles(answers, new Set(['a2']));
    expect(tiles.find((t) => t.id === 'a2')?.found).toBe(true);
    expect(tiles.find((t) => t.id === 'a1')?.found).toBe(false);
  });

  it('defaults a missing promptValue to an empty image string', () => {
    const tiles = buildTiles(answers, new Set());
    expect(tiles.find((t) => t.id === 'a3')?.image).toBe('');
  });
});
