// src/components/ListingsPage.tsx
import { useEffect, useState } from "react"
import { generateClient } from "aws-amplify/data"
import type { Schema } from "../amplify/data/resource"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const client = generateClient<Schema>()

export function ListingsPage() {
  const [listings, setListings] = useState<Schema["ArtworkListing"]["type"][]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchListings() {
      try {
        const result = await client.models.ArtworkListing.list()
        const approved = result.data.filter(item => item.status === "approved")
        setListings(approved)
      } catch (err) {
        console.error("Error fetching listings:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Explore Artwork</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-60 w-full rounded-lg" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <p>No listings available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {listings.map(listing => (
            <Card key={listing.listingId} className="overflow-hidden">
              <img
                src={`https://amplify-d3cuju75t5qzm3-te-artworkuploadsbucket1f29-3ycsnwmsg6pb.s3.us-east-1.amazonaws.com/${listing.imageS3Key}`}
                alt={listing.title || "Artwork image"}
                className="w-full h-48 object-cover rounded"
              />
              <CardContent className="p-4 space-y-2">
                <h2 className="text-lg font-semibold">{listing.title}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
