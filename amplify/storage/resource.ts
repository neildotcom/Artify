import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'artworkUploads',
  access: (allow) => ({
    'uploads/{identityId}/*': [
      allow.entity('identity').to(['read', 'write', 'delete'])
    ]
  })
});