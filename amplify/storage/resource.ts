import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'artworkUploads',
  access: (allow) => ({
    'uploads/{identityId}/*': [
      allow.authenticated.to(['read', 'write', 'delete'])
    ],
  })
});