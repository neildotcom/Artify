import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  ArtworkListing: a.model({
    userId: a.string().required(),
    listingId: a.id().required(),
    title: a.string(),
    description: a.string(),
    price: a.string(),
    category: a.string(),
    tags: a.string(),
    imageS3Key: a.string(),
    status: a.string(),
    moderationLabels: a.json(), 
  })
  .identifier(['userId', 'listingId'])
  .secondaryIndexes((index) => [
    index('imageS3Key')  // 👈 Simple GSI definition
  ])
  .authorization((allow) => [allow.authenticated()])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
});