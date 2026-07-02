import { describe, it, expect } from 'vitest';
import { composeShelves } from './composeShelves';
import type { CategoryRecord } from '../../lib/dataClient';

const cat = (over: Partial<CategoryRecord>): CategoryRecord =>
  ({ name: 'Languages', slug: 'languages', label: null, sortOrder: 0, ...over }) as CategoryRecord;

describe('composeShelves', () => {
  it('orders by sortOrder then title', () => {
    const out = composeShelves([
      cat({ slug: 'myth', name: 'Mythology', sortOrder: 2 }),
      cat({ slug: 'lang', name: 'Languages', sortOrder: 1 }),
    ]);
    expect(out.map((s) => s.slug)).toEqual(['lang', 'myth']);
  });

  it('prefers an explicit label over the name', () => {
    const [shelf] = composeShelves([cat({ name: 'Scripture', label: 'Bible & Verses' })]);
    expect(shelf.title).toBe('Bible & Verses');
  });

  it('falls back to name when label is blank', () => {
    const [shelf] = composeShelves([cat({ name: 'Scripture', label: '   ' })]);
    expect(shelf.title).toBe('Scripture');
  });

  it('drops null rows and rows without a slug', () => {
    const out = composeShelves([null, cat({ slug: '' }), cat({ slug: 'ok' })]);
    expect(out.map((s) => s.slug)).toEqual(['ok']);
  });

  it('breaks a sortOrder tie alphabetically by title', () => {
    const out = composeShelves([
      cat({ slug: 'b', name: 'Beta', sortOrder: 0 }),
      cat({ slug: 'a', name: 'Alpha', sortOrder: 0 }),
    ]);
    expect(out.map((s) => s.title)).toEqual(['Alpha', 'Beta']);
  });

  it('defaults a missing sortOrder to 0', () => {
    const out = composeShelves([cat({ slug: 'x', sortOrder: null as unknown as number })]);
    expect(out[0].sortOrder).toBe(0);
  });
});
