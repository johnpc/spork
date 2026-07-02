import { defineStorage } from '@aws-amplify/backend';

/**
 * S3 storage for deck media. Card images + audio under `media/decks/*` are
 * publicly readable (guest + authenticated). Writes are granted to the
 * 'editors' group — group members assume the group's IAM role, so
 * allow.authenticated alone would not authorize them (stoop ADR 0004 role
 * mapping). The deck-gen Lambdas additionally get scoped grants in backend.ts.
 */
export const storage = defineStorage({
  name: 'sporkMedia',
  access: (allow) => ({
    'media/decks/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
      allow.groups(['editors']).to(['read', 'write', 'delete']),
    ],
  }),
});
