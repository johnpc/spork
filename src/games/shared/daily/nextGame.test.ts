import { describe, expect, it } from 'vitest';
import { DAILY_REFS, nextUnplayed } from './nextGame';

describe('DAILY_REFS', () => {
  it('lists the daily games (quiz types + islands, no Flashcards)', () => {
    const slugs = DAILY_REFS.map((r) => r.slug);
    expect(slugs).toContain('worldle');
    expect(slugs).toContain('chess');
    expect(slugs).not.toContain('flashcards'); // browses Discover, not a daily
    expect(DAILY_REFS.length).toBe(13); // 9 quiz types + 4 islands
  });
});

describe('nextUnplayed', () => {
  it('returns the next game after the current one in shelf order', () => {
    const first = DAILY_REFS[0].slug;
    const next = nextUnplayed(first, new Set());
    expect(next?.slug).toBe(DAILY_REFS[1].slug);
  });

  it('skips games already played today', () => {
    const played = new Set([DAILY_REFS[1].dailyKey]);
    const next = nextUnplayed(DAILY_REFS[0].slug, played);
    expect(next?.slug).toBe(DAILY_REFS[2].slug);
  });

  it('wraps around past the end of the shelf', () => {
    const last = DAILY_REFS[DAILY_REFS.length - 1].slug;
    const next = nextUnplayed(last, new Set());
    expect(next?.slug).toBe(DAILY_REFS[0].slug);
  });

  it('returns null when every other game is done', () => {
    const played = new Set(DAILY_REFS.map((r) => r.dailyKey));
    expect(nextUnplayed(DAILY_REFS[0].slug, played)).toBeNull();
  });

  it('returns null for an unknown current slug', () => {
    expect(nextUnplayed('not-a-game', new Set())).toBeNull();
  });
});
