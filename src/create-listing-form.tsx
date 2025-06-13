// src/components/CreateListingForm.tsx
import React, { useState } from "react";
import { uploadData } from "@aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { getCurrentUser } from "aws-amplify/auth";
import { v4 as uuid } from "uuid";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    title: "",
    description: "",
    price: "",
    category: "",
    tags: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be signed in to create a listing.");
    if (images.length === 0) return alert("Please upload at least one image.");

    setIsSubmitting(true);
    try {
      const { userId } = await getCurrentUser();
      if (!userId) throw new Error("Could not fetch user ID.");

      const file = images[0];
      const uploadTask = uploadData({
        path: `uploads/${userId}/${file.name}`,
        data: file,
        options: {
          bucket: "artworkUploads",
          contentType: file.type,
        },
      });
      const result = await uploadTask.result;

      const payload = {
        userId,
        listingId: uuid(),
        status: "pending",
        imageS3Key: result.path,
        ...form,
      };

      const dbResult = await client.models.ArtworkListing.create(payload);
      console.log("DynamoDB create result:", dbResult);
      alert("Listing submitted successfully!");

      setForm({ title: "", description: "", price: "", category: "", tags: "" });
      setImages([]);
      setPreviews([]);
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      alert("Something went wrong. Please check the console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardContent className="space-y-4 py-6">
        <h2 className="text-2xl font-bold">Create Artwork Listing</h2>

        <div>
          <Label>Upload Artwork</Label>
          <Input type="file" multiple accept="image/*" onChange={handleImageChange} />
          <div className="flex flex-wrap gap-4 mt-2">
            {previews.map((src, idx) => (
              <div key={idx} className="relative w-24 h-24">
                <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover rounded" />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute top-0 right-0"
                  onClick={() => removeImage(idx)}
                >
                  ❌
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input type="text" name="title" value={form.title} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea name="description" value={form.description} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label>Price (USD)</Label>
          <Input type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="e.g., abstract, digital"
          />
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <Input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="e.g., ethereal, portrait"
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
          {isSubmitting ? "Submitting..." : "Create Listing"}
        </Button>
      </CardContent>
    </Card>
  );
}
