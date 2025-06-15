import { useEffect, useState } from "react"
import { generateClient } from "aws-amplify/data"
import type { Schema } from "../amplify/data/resource"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getUrl } from "@aws-amplify/storage"
import { useAuthenticator } from "@aws-amplify/ui-react"

const client = generateClient<Schema>()

type ListingWithUrl = Schema["ArtworkListing"]["type"] & {
  signedUrl?: string
  moderationLabels?: { Label: string; Confidence: number }[]
}

export function MyListingsPage() {
  const { user } = useAuthenticator((context) => [context.user])
  const [listings, setListings] = useState<ListingWithUrl[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchListings() {
      try {
        const result = await client.models.ArtworkListing.list({
          filter: { userId: { eq: user?.userId } },
        })

        const enrichedListings: ListingWithUrl[] = await Promise.all(
          result.data.map(async (listing) => {
            const moderationLabels = (() => {
              if (Array.isArray(listing.moderationLabels)) {
                return listing.moderationLabels as { Label: string; Confidence: number }[]
              }
              if (typeof listing.moderationLabels === "string") {
                try {
                  const parsed = JSON.parse(listing.moderationLabels)
                  return Array.isArray(parsed) ? parsed : undefined
                } catch {
                  return undefined
                }
              }
              return undefined
            })()

            if (!listing.imageS3Key || listing.status === "flagged") {
              return { ...listing, moderationLabels }
            }

            try {
              const { url } = await getUrl({ path: listing.imageS3Key })
              return { ...listing, signedUrl: url.toString(), moderationLabels }
            } catch {
              return { ...listing, moderationLabels }
            }
          })
        )

        setListings(enrichedListings)
      } catch (err) {
        console.error("Error fetching listings:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [user?.userId])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">My Listings</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-60 w-full rounded-lg" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <p>No listings found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing.listingId} className="overflow-hidden relative">
              {listing.status !== "flagged" && (
                <img
                  src={listing.signedUrl || ""}
                  alt={listing.title || "Artwork image"}
                  className="w-full h-48 object-cover"
                />
              )}

              <CardContent className="p-4 space-y-2">
                <h2 className="text-lg font-semibold">{listing.title}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {listing.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-semibold">${listing.price}</span>
                  <Badge variant="outline">{listing.category}</Badge>
                </div>
                {listing.tags && (
                  <div className="text-xs text-muted-foreground mt-2">
                    {listing.tags.split(",").map((tag, i) => (
                      <span key={i} className="mr-2">#{tag.trim()}</span>
                    ))}
                  </div>
                )}
                {listing.status === "flagged" && (
                  <div className="mt-2 text-sm text-red-600 border border-red-500 p-2 rounded">
                    <p className="font-semibold mb-1">⚠️ Flagged by Moderation</p>
                    {listing.moderationLabels?.length ? (
                      <ul className="list-disc list-inside text-xs">
                        {listing.moderationLabels.map((label, i) => (
                          <li key={i}>{label.Label} ({Math.round(label.Confidence)}%)</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs italic">No labels provided.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
