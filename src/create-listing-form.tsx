// src/components/CreateListingForm.tsx
import React, { useState } from "react";
import { uploadData } from "@aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { getCurrentUser } from "aws-amplify/auth";
import { v4 as uuid } from "uuid";

import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

const client = generateClient<Schema>();

interface FormState {
  title: string;
  description: string;
  price: string;
  category: string;
  tags: string;
}

export function CreateListingForm() {
  const { user } = useAuthenticator((ctx) => [ctx.user]);
  const [form, setForm] = useState<FormState>({
    title: "", description: "", price: "", category: "", tags: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be signed in.");
    if (!images.length) return alert("Please upload at least one image.");

    setIsSubmitting(true);
    try {
      const { userId } = await getCurrentUser();
      if (!userId) throw new Error("Missing user ID.");

      const file = images[0];
      const { path: imageKey } = await uploadData({
        path: `uploads/${userId}/${file.name}`,
        data: file,
        options: { bucket: "artworkUploads", contentType: file.type },
      }).result;

      const payload = { userId, listingId: uuid(), status: "pending", imageS3Key: imageKey, ...form };
      await client.models.ArtworkListing.create(payload);
      alert("Listing submitted successfully!");
      setForm({ title: "", description: "", price: "", category: "", tags: "" });
      setImages([]); setPreviews([]);
    } catch (err) {
      console.error(err);
      alert("Error submitting listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto mt-10">

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold text-left">Artwork Images</h2>

          <div className="grid grid-cols-3 gap-4">
            {previews.map((src, idx) => (
              <div key={idx} className="relative aspect-square rounded-md overflow-hidden border">
                <img src={src} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {previews.length < 5 && (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-md aspect-square cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload Image</span>
                <Input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </label>
            )}
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold text-left">Artwork Details</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-left block" htmlFor="title">Title</Label>
              <Input id="title" name="title" value={form.title} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label className="text-left block" htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={form.description} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-left block" htmlFor="price">Price (USD)</Label>
                <Input id="price" name="price" type="number" value={form.price} onChange={handleChange} min="0" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label className="text-left block" htmlFor="category">Category</Label>
                <Input id="category" name="category" value={form.category} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-left block" htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" value={form.tags} onChange={handleChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => setForm({ title: "", description: "", price: "", category: "", tags: "" })}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Create Listing"}</Button>
      </div>

    </form>
  );
}
