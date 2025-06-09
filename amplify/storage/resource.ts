import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'artworkStorage',
  access: (auth) => ({
    'uploads/': {
      read: true,
      write: true,
      delete: true,
    },
  }),
});