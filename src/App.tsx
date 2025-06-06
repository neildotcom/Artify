import { useState } from "react";
import { uploadData } from 'aws-amplify/storage';

function App() {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

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
          accessLevel: 'artwork' // matches your storage.ts configuration
        }
      });
      console.log('Upload successful:', result);
      setUploadedFile(file.name);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  }
  
  return (
    <main>
      <h1>Image Upload to S3</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        {uploading && <p>Uploading...</p>}
        {uploadedFile && <p>Last uploaded file: {uploadedFile}</p>}
      </div>
    </main>
  );
}

export default App;
