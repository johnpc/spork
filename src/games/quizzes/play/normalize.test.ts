import { describe, it, expect } from 'vitest';
import { normalize } from './normalize';

describe('normalize', () => {
  it('lowercases and trims', () => {
    expect(normalize('  Brazil  ')).toBe('brazil');
  });

  it("strips accents (Côte d'Ivoire → cote divoire)", () => {
    expect(normalize("Côte d'Ivoire")).toBe('cote divoire');
  });

  it('drops punctuation and collapses whitespace', () => {
    expect(normalize('U.S.A.')).toBe('usa');
    expect(normalize('South   Korea')).toBe('south korea');
  });

  it('treats accent/case/punct variants as equal', () => {
    expect(normalize('SÃO TOMÉ')).toBe(normalize('sao tome'));
  });

  it('returns empty string for punctuation-only input', () => {
    expect(normalize('!!!')).toBe('');
  });
});
