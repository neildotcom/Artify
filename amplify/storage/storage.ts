import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  access: (user) => ({
    "uploads/": {
      read: true,
      write: true,
    },
  }),
});