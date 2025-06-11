import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  ArtworkListing: a.model({
    userId: a.string().required(),        // required
    listingId: a.id().required(),
    title: a.string(),         // optional by default
    description: a.string(),
    price: a.string(),
    category: a.string(),
    medium: a.string(),
    dimensions: a.string(),
    year: a.string(),
    tags: a.string(),
    imageS3Key: a.string(),
    status: a.string(),        // e.g., 'pending', 'completed'
  })
  .identifier(['userId', 'listingId']) // Composite key
  .authorization((allow) => [allow.authenticated()])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
});