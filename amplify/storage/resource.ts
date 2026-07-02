import { defineStorage } from '@aws-amplify/backend';

/**
 * S3 storage for game media. Flashcard media under `media/decks/*` and quiz
 * media (PICTURE_BOX answer images) under `media/quizzes/*` are publicly
 * readable (guest + authenticated) so the guest-only play client can load them.
 * Writes are granted to the 'editors' group — group members assume the group's
 * IAM role, so allow.authenticated alone would not authorize them (stoop ADR
 * 0004 role mapping). The generation Lambdas get additional scoped grants in
 * backend.ts.
 */
export const storage = defineStorage({
  name: 'sporkMedia',
  access: (allow) => ({
    'media/decks/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
      allow.groups(['editors']).to(['read', 'write', 'delete']),
    ],
    'media/quizzes/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
      allow.groups(['editors']).to(['read', 'write', 'delete']),
    ],
  }),
});
