/**
 * Pure BCP-47 language → Amazon Polly VoiceId mapping for card pronunciation
 * audio. Kept a tested table so the audio edge stays trivial and adding a
 * language is a one-line change. Falls back to a US English voice.
 */
const VOICE_BY_LANGUAGE: Record<string, string> = {
  'es-ES': 'Lucia',
  'es-MX': 'Mia',
  'en-US': 'Joanna',
  'en-GB': 'Amy',
  'fr-FR': 'Lea',
  'de-DE': 'Vicki',
  'it-IT': 'Bianca',
  'pt-BR': 'Camila',
  'ja-JP': 'Takumi',
};

export interface Voice {
  voiceId: string;
  languageCode: string;
}

/** Resolve a Polly voice for a language tag (default en-US / Joanna). */
export function voiceForLanguage(language: string | null | undefined): Voice {
  const lang = language ?? 'en-US';
  const voiceId = VOICE_BY_LANGUAGE[lang] ?? 'Joanna';
  const languageCode = VOICE_BY_LANGUAGE[lang] ? lang : 'en-US';
  return { voiceId, languageCode };
}
