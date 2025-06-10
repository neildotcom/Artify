// src/components/CreateListingForm.tsx
import React, { useState } from "react";
import { uploadData } from "@aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { getCurrentUser } from "aws-amplify/auth";

const client = generateClient<Schema>();

interface FormState {
  title: string;
  description: string;
  price: string;
  category: string;
  medium: string;
  dimensions: string;
  year: string;
  tags: string;
}

export function CreateListingForm() {
  const { user } = useAuthenticator((ctx) => [ctx.user]);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    price: "",
    category: "",
    medium: "",
    dimensions: "",
    year: new Date().getFullYear().toString(),
    tags: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle text/select input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection & preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  // Remove preview & file
  const removeImage = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("You must be signed in to create a listing.");
      return;
    }
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get identityId for S3 path
      const { userId: identityId } = await getCurrentUser();
      if (!identityId) throw new Error("Could not fetch identity ID.");

      // Upload first image
      const file = images[0];
      const uploadTask = uploadData({
        path: `uploads/${identityId}/${images[0].name}`,
        data: file,
        options: {
          bucket: "artworkUploads",
          contentType: file.type,
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes) {
              console.log(
                `Upload progress: ${Math.round((transferredBytes / totalBytes) * 100)}%`
              );
            }
          },
        },
      });
      const result = await uploadTask.result;
      console.log("S3 upload result:", result);
      const imageKey = result.path;

      // Build and write metadata
      const payload: Partial<Schema["ArtworkListing"]["type"]> = {
        id: crypto.randomUUID(),
        userId: identityId,
        createdAt: new Date().toISOString(),
        status: "pending",
        imageS3Key: imageKey,
        title: form.title || undefined,
        description: form.description || undefined,
        price: form.price || undefined,
        category: form.category || undefined,
        medium: form.medium || undefined,
        dimensions: form.dimensions || undefined,
        year: form.year || undefined,
        tags: form.tags || undefined,
      };
      console.log("Creating listing payload:", payload);

      const dbResult = await client.models.ArtworkListing.create(payload);
      console.log("DynamoDB create result:", dbResult);

      alert("Listing submitted! (incomplete data allowed)");

      // Reset form
      setForm({
        title: "",
        description: "",
        price: "",
        category: "",
        medium: "",
        dimensions: "",
        year: new Date().getFullYear().toString(),
        tags: "",
      });
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
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2>Create Artwork Listing</h2>

      {/* Image Upload */}
      <div>
        <label>Upload Images (up to 5):</label>
        <input type="file" multiple accept="image/*" onChange={handleImageChange} />
        <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
          {previews.map((src, idx) => (
            <div key={idx} style={{ position: "relative" }}>
              <img src={src} alt={`preview-${idx}`} width={100} height={100} />
              <button type="button" onClick={() => removeImage(idx)} style={{ position: "absolute", top: 0, right: 0 }}>
                ❌
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label>Title</label>
        <input type="text" name="title" value={form.title} onChange={handleChange} />
      </div>
      {/* Description */}
      <div>
        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} />
      </div>
      {/* Price */}
      <div>
        <label>Price (USD)</label>
        <input type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" />
      </div>
      {/* Category */}
      <div>
        <label>Category</label>
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select</option>
          {[
            "Painting","Drawing","Photography","Digital Art","Sculpture",
            "Printmaking","Mixed Media","Illustration","Abstract","Watercolor","Other",
          ].map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      {/* Medium */}
      <div>
        <label>Medium</label>
        <input type="text" name="medium" value={form.medium} onChange={handleChange} />
      </div>
      {/* Dimensions */}
      <div>
        <label>Dimensions</label>
        <input type="text" name="dimensions" value={form.dimensions} onChange={handleChange} />
      </div>
      {/* Year */}
      <div>
        <label>Year Created</label>
        <input type="number" name="year" value={form.year} onChange={handleChange} min="1900" max={new Date().getFullYear()} />
      </div>
      {/* Tags */}
      <div>
        <label>Tags</label>
        <input type="text" name="tags" value={form.tags} onChange={handleChange} placeholder="e.g., abstract, modern" />
      </div>

      <div style={{ marginTop: 20 }}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Create Listing"}
        </button>
      </div>
    </form>
  );
}
