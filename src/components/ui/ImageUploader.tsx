'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

interface ImageUploaderProps {
  onUploadSuccess?: (result: UploadResult) => void;
  folder?: string;
  maxFiles?: number;
}

export default function ImageUploader({ 
  onUploadSuccess, 
  folder = 'general',
  maxFiles = 1 
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadResult[]>(() => {
    // Load from localStorage on component mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`uploaded-images-${folder}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setUploading(true);

    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Upload failed');
        }

        const uploadResult: UploadResult = {
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.size,
        };

        setUploadedImages(prev => {
          const newImages = [...prev, uploadResult];
          // Save to localStorage
          localStorage.setItem(`uploaded-images-${folder}`, JSON.stringify(newImages));
          return newImages;
        });
        onUploadSuccess?.(uploadResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setUploading(false);
    }
  }, [folder, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      // Update localStorage
      localStorage.setItem(`uploaded-images-${folder}`, JSON.stringify(newImages));
      return newImages;
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={uploading} />
        
        {uploading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        ) : (
          <div className="text-6xl mb-4">📷</div>
        )}
        
        <p className="text-gray-600">
          {uploading 
            ? 'กำลังอัปโหลด...' 
            : isDragActive
            ? 'วางไฟล์ที่นี่...'
            : 'ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์'
          }
        </p>
        <p className="text-sm text-gray-400 mt-2">
          รองรับ: JPG, PNG, WebP, GIF (สูงสุด 5MB)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
          {error}
        </div>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">รูปที่อัปโหลดแล้ว:</h3>
          <div className="space-y-4">
            {uploadedImages.map((img, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Image
                      src={img.url}
                      alt={`Uploaded ${index + 1}`}
                      width={100}
                      height={100}
                      className="rounded object-cover"
                    />
                    <div className="mt-2 text-sm text-gray-600">
                      <p><strong>ขนาด:</strong> {img.width} × {img.height}</p>
                      <p><strong>รูปแบบ:</strong> {img.format.toUpperCase()}</p>
                      <p><strong>ไฟล์:</strong> {(img.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={img.url}
                        readOnly
                        className="w-full p-2 text-xs bg-gray-100 border rounded"
                        onClick={(e) => e.currentTarget.select()}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeImage(index)}
                    className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}