import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'artworkStorage',
  access: (allow) => ({
    'uploads/': [
      allow.guest.to(['read', 'write']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
  }),
});