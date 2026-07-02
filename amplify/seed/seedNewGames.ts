/** Seed the Acrostic, Quizzle, and Chess Attack games. Each mirrors seedLadders:
 * create every fixture as a PUBLISHED row, JSON-encoding the structured payloads
 * the play engines parse. Kept in one file since each loop is tiny. */
import { client, EDITOR_WRITE } from './seedClient';
import { seedAcrostics } from './fixtures/acrostic';
import { seedQuizzles } from './fixtures/quizzle';
import { seedChessPuzzles } from './fixtures/chess';
import { dateFor } from './fixtures/seedDates';

export async function seedAcrosticData(): Promise<number> {
  const now = new Date().toISOString();
  for (let i = 0; i < seedAcrostics.length; i++) {
    const a = seedAcrostics[i];
    const { errors } = await client.models.Acrostic.create(
      {
        title: a.title,
        quote: a.quote,
        author: a.author,
        clues: JSON.stringify(a.clues),
        difficulty: a.difficulty,
        status: 'PUBLISHED',
        publishedAt: now,
        puzzleDate: dateFor(i, seedAcrostics.length),
      },
      EDITOR_WRITE,
    );
    if (errors) throw new Error(`Acrostic ${a.title}: ${JSON.stringify(errors)}`);
  }
  console.log(`Seeded ${seedAcrostics.length} acrostics.`);
  return seedAcrostics.length;
}

export async function seedQuizzleData(): Promise<number> {
  const now = new Date().toISOString();
  for (let i = 0; i < seedQuizzles.length; i++) {
    const q = seedQuizzles[i];
    const { errors } = await client.models.Quizzle.create(
      {
        topic: q.topic,
        questions: JSON.stringify(q.questions),
        startingBank: q.startingBank,
        status: 'PUBLISHED',
        publishedAt: now,
        puzzleDate: dateFor(i, seedQuizzles.length),
      },
      EDITOR_WRITE,
    );
    if (errors) throw new Error(`Quizzle ${q.topic}: ${JSON.stringify(errors)}`);
  }
  console.log(`Seeded ${seedQuizzles.length} quizzles.`);
  return seedQuizzles.length;
}

export async function seedChessData(): Promise<number> {
  const now = new Date().toISOString();
  for (let i = 0; i < seedChessPuzzles.length; i++) {
    const p = seedChessPuzzles[i];
    const { errors } = await client.models.ChessAttack.create(
      {
        name: p.name,
        position: p.position, // already a JSON string in the fixture
        solution: p.solution,
        movesToWin: p.movesToWin,
        difficulty: p.difficulty,
        status: 'PUBLISHED',
        publishedAt: now,
        puzzleDate: dateFor(i, seedChessPuzzles.length),
      },
      EDITOR_WRITE,
    );
    if (errors) throw new Error(`ChessAttack ${p.name}: ${JSON.stringify(errors)}`);
  }
  console.log(`Seeded ${seedChessPuzzles.length} chess puzzles.`);
  return seedChessPuzzles.length;
}
