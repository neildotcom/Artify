import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'artworkUploads',
  access: (allow) => ({
    // Each authenticated user gets full access to their own subfolder
    'uploads/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});
