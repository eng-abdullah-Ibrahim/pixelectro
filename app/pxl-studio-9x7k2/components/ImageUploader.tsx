"use client";

import { useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  name: string;
  initialUrl?: string;
  folder?: string;
}

export default function ImageUploader({ name, initialUrl, folder = "pixelectro/assets" }: ImageUploaderProps) {
  const [url, setUrl] = useState(initialUrl || "");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    
    const file = e.target.files[0];

    try {
      // 1. Get Upload Signature from Backend
      const signRes = await fetch('/api/admin/cloudinary-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder })
      });
      if (!signRes.ok) throw new Error("Failed to get upload signature");
      const { timestamp, signature, cloudName, apiKey } = await signRes.json();

      // 2. Upload file directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);
      
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadRes.ok) {
        throw new Error(`Failed to upload ${file.name} to Cloudinary`);
      }

      const cloudinaryData = await uploadRes.json();
      setUrl(cloudinaryData.secure_url);
    } catch (err) {
      console.error(err);
      alert("An error occurred during upload. Please try again.");
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="image-uploader">
      <input type="hidden" name={name} value={url} />
      
      {url ? (
        <div className="relative inline-block border border-white/10 p-1 rounded bg-[#111]">
          <img src={url} alt="Uploaded" className="max-w-[200px] max-h-[150px] object-contain rounded" />
          <button 
            type="button" 
            onClick={() => setUrl("")}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-lg"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-md p-6 bg-white/5 hover:bg-white/10 transition-colors w-full max-w-sm cursor-pointer relative">
          <input 
            type="file" 
            accept="image/*,video/*"
            className="hidden" 
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {isUploading ? (
            <>
              <Loader2 size={32} className="text-blue-400 mb-2 animate-spin" />
              <span className="text-sm font-medium text-blue-400">Uploading...</span>
            </>
          ) : (
            <>
              <UploadCloud size={32} className="text-white/50 mb-2" />
              <span className="text-sm font-medium">Click to Upload Image</span>
            </>
          )}
        </label>
      )}
    </div>
  );
}
