import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'artworkUploadsBucket',
  access: (allow) => ({
    'uploads/{identityId}/*': [
      allow.entity('identity').to(['read', 'write', 'delete'])
    ]
  })
});