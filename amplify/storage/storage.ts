import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'listingimages',
  configurations: {
    artwork: {
      permissions: {
        read: ['public'],
        write: ['public'],
      },
    },
  },
});

    
