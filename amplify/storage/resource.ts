import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: 'artworkUploads',
  access: allow => ({
    'uploads/*': [
      allow.authenticated.to(['get', 'write', 'delete']),
    ]
  })
});