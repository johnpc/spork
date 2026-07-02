import { describe, it, expect } from 'vitest';
import { voiceForLanguage } from './voiceForLanguage';

describe('voiceForLanguage', () => {
  it('maps a known language to its neural voice', () => {
    expect(voiceForLanguage('es-ES')).toEqual({ voiceId: 'Lucia', languageCode: 'es-ES' });
  });

  it('defaults an unknown language to en-US / Joanna', () => {
    expect(voiceForLanguage('xx-XX')).toEqual({ voiceId: 'Joanna', languageCode: 'en-US' });
  });

  it('defaults null/undefined to en-US / Joanna', () => {
    expect(voiceForLanguage(null)).toEqual({ voiceId: 'Joanna', languageCode: 'en-US' });
    expect(voiceForLanguage(undefined).voiceId).toBe('Joanna');
  });
});
