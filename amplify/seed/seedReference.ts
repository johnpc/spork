/** Clears all models and seeds the Category reference data (Discover shelves). */
import { client, EDITOR_WRITE, clearOneModel } from './seedClient';
import { seedCategories } from './fixtures/categories';

/** Wipe every model. Cards reference Decks, so clear Cards first. The seed runs
 * as the editor/test user, so it also clears that user's own UserDeck rows
 * (owner-scoped) — keeping the shared e2e account from accumulating saves. */
export async function clearAll(): Promise<void> {
  await clearOneModel(client.models.UserCardReview);
  await clearOneModel(client.models.UserDeck);
  await clearOneModel(client.models.Card);
  await clearOneModel(client.models.Deck);
  await clearOneModel(client.models.Answer);
  await clearOneModel(client.models.Quiz);
  await clearOneModel(client.models.WordLadder);
  await clearOneModel(client.models.Acrostic);
  await clearOneModel(client.models.Quizzle);
  await clearOneModel(client.models.ChessAttack);
  await clearOneModel(client.models.Category);
}

/** Seed the Discover shelf categories. Returns the count created. */
export async function seedReferenceData(): Promise<number> {
  let created = 0;
  for (const category of seedCategories) {
    const { errors } = await client.models.Category.create(
      {
        name: category.name,
        slug: category.slug,
        label: category.label,
        sortOrder: category.sortOrder,
      },
      EDITOR_WRITE,
    );
    if (errors) throw new Error(`Category ${category.name}: ${JSON.stringify(errors)}`);
    created += 1;
  }
  console.log(`Seeded ${created} categories.`);
  return created;
}

/**
 * Idempotent, NON-DESTRUCTIVE category ensure — creates only the slugs that are
 * missing, never clears. Safe to run against prod (which holds real decks).
 * Returns the count created. This is the fix-forward for "prod had no
 * categories": run `npm run seed:categories` after a fresh backend deploy.
 */
export async function ensureCategories(): Promise<number> {
  const { data: existing } = await client.models.Category.list({ limit: 500, ...EDITOR_WRITE });
  const have = new Set((existing ?? []).map((c) => c?.slug));
  let created = 0;
  for (const category of seedCategories) {
    if (have.has(category.slug)) continue;
    const { errors } = await client.models.Category.create(
      {
        name: category.name,
        slug: category.slug,
        label: category.label,
        sortOrder: category.sortOrder,
      },
      EDITOR_WRITE,
    );
    if (errors) throw new Error(`Category ${category.name}: ${JSON.stringify(errors)}`);
    created += 1;
  }
  console.log(`Ensured categories — created ${created}, already had ${have.size}.`);
  return created;
}
