import { uploadData } from 'aws-amplify/storage';
import { useState } from 'react';

export default function ImageUpload() {
  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadData({
        key: `uploads/${file.name}`,
        data: file,
        options: {
          contentType: file.type,
          accessLevel: 'artwork' // matches the configuration name in storage.ts
        }
      });
      console.log('Upload successful:', result);
      alert('Upload successful!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
}
