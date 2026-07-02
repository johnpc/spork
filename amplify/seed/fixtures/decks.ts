/** Demo published decks + their cards — declarative seed data (gate-exempt). */
export interface SeedCard {
  ord: number;
  front: string;
  back: string;
  hint?: string;
  example?: string;
}

export interface SeedDeck {
  topic: string;
  categorySlug: string;
  description: string;
  voiceLanguage: string;
  cards: SeedCard[];
}

export const seedDecks: SeedDeck[] = [
  {
    topic: 'Top Spanish Phrases',
    categorySlug: 'languages',
    description: 'Everyday phrases to get you talking fast.',
    voiceLanguage: 'es-ES',
    cards: [
      { ord: 0, front: 'Hola', back: 'Hello', hint: 'greeting', example: '¡Hola! ¿Qué tal?' },
      { ord: 1, front: 'Gracias', back: 'Thank you', example: 'Muchas gracias.' },
      { ord: 2, front: 'Por favor', back: 'Please', example: 'Un café, por favor.' },
    ],
  },
  {
    topic: 'Greek Gods',
    categorySlug: 'mythology',
    description: 'The Olympians and what they rule.',
    voiceLanguage: 'en-US',
    cards: [
      { ord: 0, front: 'Zeus', back: 'King of the gods; sky and thunder' },
      { ord: 1, front: 'Poseidon', back: 'God of the sea' },
    ],
  },
];
