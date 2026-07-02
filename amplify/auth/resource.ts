import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  // Editorial/admin group — gates the native authoring tool (/compose) and
  // owns write access to the Story registry. Members are managed in Cognito.
  groups: ['editors'],
});
