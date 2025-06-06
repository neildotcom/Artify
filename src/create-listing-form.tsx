import React, { useState } from "react";

export function CreateListingForm() {
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
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newImages]);
      const newPreviews = newImages.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual image upload and save logic
      await new Promise((res) => setTimeout(res, 1500));
      alert("Listing submitted!");
    } catch (err) {
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
          {previews.map((src, index) => (
            <div key={index} style={{ position: "relative" }}>
              <img src={src} alt={`preview-${index}`} width="100" height="100" />
              <button type="button" onClick={() => removeImage(index)} style={{ position: "absolute", top: 0, right: 0 }}>
                ❌
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label>Title*</label>
        <input type="text" name="title" value={form.title} onChange={handleChange} required />
      </div>

      <div>
        <label>Description*</label>
        <textarea name="description" value={form.description} onChange={handleChange} required />
      </div>

      <div>
        <label>Price (USD)*</label>
        <input type="number" name="price" min="0" step="0.01" value={form.price} onChange={handleChange} required />
      </div>

      <div>
        <label>Category*</label>
        <select name="category" value={form.category} onChange={handleChange} required>
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
        <label>Medium*</label>
        <input type="text" name="medium" value={form.medium} onChange={handleChange} required />
      </div>

      <div>
        <label>Dimensions</label>
        <input type="text" name="dimensions" value={form.dimensions} onChange={handleChange} />
      </div>

      <div>
        <label>Year Created*</label>
        <input type="number" name="year" value={form.year} onChange={handleChange} min="1900" max={new Date().getFullYear()} required />
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

      <div style={{ marginTop: "20px" }}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Create Listing"}
        </button>
      </div>
    </form>
  );
}
