/** Seed demo published decks + their cards (Discover decks read path). */
import { client, EDITOR_WRITE } from './seedClient';
import { seedDecks } from './fixtures/decks';

/** Create each demo deck (PUBLISHED) and its cards. Returns the count created. */
export async function seedDeckData(): Promise<number> {
  let created = 0;
  const now = new Date().toISOString();
  for (const d of seedDecks) {
    const { data: deck, errors } = await client.models.Deck.create(
      {
        topic: d.topic,
        categorySlug: d.categorySlug,
        description: d.description,
        voiceLanguage: d.voiceLanguage,
        status: 'PUBLISHED',
        cardCount: d.cards.length,
        publishedAt: now,
      },
      EDITOR_WRITE,
    );
    if (errors || !deck) throw new Error(`Deck ${d.topic}: ${JSON.stringify(errors)}`);

    for (const c of d.cards) {
      const { errors: cErr } = await client.models.Card.create(
        {
          deckId: deck.id,
          ord: c.ord,
          front: c.front,
          back: c.back,
          hint: c.hint,
          example: c.example,
        },
        EDITOR_WRITE,
      );
      if (cErr) throw new Error(`Card ${d.topic}#${c.ord}: ${JSON.stringify(cErr)}`);
    }
    created += 1;
  }
  console.log(`Seeded ${created} decks.`);
  return created;
}
