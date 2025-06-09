import React, { useState } from "react";
import { uploadData } from "@aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";

const client = generateClient<Schema>();

export function CreateListingForm() {
  const { user } = useAuthenticator((context) => [context.user]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    medium: "",
    dimensions: "",
    year: new Date().getFullYear().toString(),
    tags: "",
    isOriginal: false,
    isFramed: false,
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages((prev) => [...prev, ...files]);
      setPreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
    }
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await uploadData({
        path: `uploads/${user?.username}/${images[0].name}`,
        data: images[0],
      });
      const imageKey = (result as any).key || (result as any).path || '';

      const payload: Partial<Schema["ArtworkListing"]["type"]> = {
        id: crypto.randomUUID(),
        userId: user?.username ?? "",
        createdAt: new Date().toISOString(),
        status: "pending",
        imageS3Key: imageKey,
      };

      if (form.title) payload.title = form.title;
      if (form.description) payload.description = form.description;
      if (form.price) payload.price = form.price;
      if (form.category) payload.category = form.category;
      if (form.medium) payload.medium = form.medium;
      if (form.dimensions) payload.dimensions = form.dimensions;
      if (form.year) payload.year = form.year;
      if (form.tags) payload.tags = form.tags;

      await client.models.ArtworkListing.create(payload);

      alert("Listing submitted! (incomplete data allowed)");
      setForm({
        title: "",
        description: "",
        price: "",
        category: "",
        medium: "",
        dimensions: "",
        year: new Date().getFullYear().toString(),
        tags: "",
        isOriginal: false,
        isFramed: false,
      });
      setImages([]);
      setPreviews([]);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2>Create Artwork Listing</h2>
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
      <div>
        <label>Title</label>
        <input type="text" name="title" value={form.title} onChange={handleChange} />
      </div>
      <div>
        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} />
      </div>
      <div>
        <label>Price (USD)</label>
        <input type="number" name="price" min="0" step="0.01" value={form.price} onChange={handleChange} />
      </div>
      <div>
        <label>Category</label>
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select</option>
          {[
            "Painting",
            "Drawing",
            "Photography",
            "Digital Art",
            "Sculpture",
            "Printmaking",
            "Mixed Media",
            "Illustration",
            "Abstract",
            "Watercolor",
            "Other",
          ].map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Medium</label>
        <input type="text" name="medium" value={form.medium} onChange={handleChange} />
      </div>
      <div>
        <label>Dimensions</label>
        <input type="text" name="dimensions" value={form.dimensions} onChange={handleChange} />
      </div>
      <div>
        <label>Year Created</label>
        <input type="number" name="year" value={form.year} onChange={handleChange} min="1900" max={new Date().getFullYear()} />
      </div>
      <div>
        <label>Tags</label>
        <input type="text" name="tags" value={form.tags} onChange={handleChange} placeholder="e.g., abstract, modern" />
      </div>
      <div>
        <label>
          <input type="checkbox" name="isOriginal" checked={form.isOriginal} onChange={handleChange} />
          Original Artwork
        </label>
      </div>
      <div>
        <label>
          <input type="checkbox" name="isFramed" checked={form.isFramed} onChange={handleChange} />
          Framed
        </label>
      </div>
      <div style={{ marginTop: 20 }}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Create Listing"}
        </button>
      </div>
    </form>
  );
}