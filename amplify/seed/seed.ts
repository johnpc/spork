/**
 * Idempotent seed runner: Discover shelf categories (and, in later slices, the
 * deck registry). Clears every model, then inserts the seed set so re-running
 * converges to the same state. Signs in as an editor — all writes go through
 * userPool. Helpers live in ./seedClient + ./seedReference; data in ./fixtures.
 *
 * Usage:
 *   npm run prod-config   # ensure amplify_outputs.json exists
 *   npm run seed          # runs this script via tsx
 */
import { signIn, signOut } from 'aws-amplify/auth';
import './seedClient'; // configures Amplify + loads .env.local
import { clearAll, seedReferenceData } from './seedReference';
import { seedDeckData } from './seedDecks';
import { seedQuizData } from './seedQuizzes';
import { seedLadderData } from './seedLadders';
import { seedAcrosticData, seedQuizzleData, seedChessData } from './seedNewGames';
import { seedWordleData } from './seedWordle';
import { seedConnectionsData } from './seedConnections';
import { seedSpellingBeeData } from './seedSpellingBee';

async function main() {
  const username = process.env.TEST_USERNAME;
  const password = process.env.TEST_PASSWORD;
  if (!username || !password) {
    throw new Error(
      'TEST_USERNAME / TEST_PASSWORD required to seed (writes need an editor session).',
    );
  }
  await signOut().catch(() => {});
  await signIn({ username, password });

  await clearAll();
  console.log('Cleared all models.');

  await seedReferenceData();
  await seedDeckData();
  await seedQuizData();
  await seedLadderData();
  await seedAcrosticData();
  await seedQuizzleData();
  await seedChessData();
  await seedWordleData();
  await seedConnectionsData();
  await seedSpellingBeeData();

  await signOut().catch(() => {});
  console.log('Seed complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
