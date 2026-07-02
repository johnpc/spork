/**
 * Non-destructive category seed runner. Unlike `npm run seed` (which clears
 * every model), this ONLY ensures the Discover shelf categories exist — safe to
 * run against prod, which holds real decks. Use after a fresh backend deploy:
 *
 *   npm run prod-config        # point amplify_outputs.json at the target backend
 *   npm run seed:categories
 */
import { signIn, signOut } from 'aws-amplify/auth';
import './seedClient'; // configures Amplify + loads .env.local
import { ensureCategories } from './seedReference';

async function main() {
  const username = process.env.TEST_USERNAME;
  const password = process.env.TEST_PASSWORD;
  if (!username || !password) {
    throw new Error('TEST_USERNAME / TEST_PASSWORD required (category writes need an editor).');
  }
  await signOut().catch(() => {});
  await signIn({ username, password });
  await ensureCategories();
  await signOut().catch(() => {});
  console.log('Category ensure complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
