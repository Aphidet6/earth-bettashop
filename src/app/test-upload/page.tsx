'use client';

import ImageUploader from '@/components/ui/ImageUploader';

export default function TestUploadPage() {
  const handleUploadSuccess = (result: any) => {
    console.log('อัปโหลดสำเร็จ!', result);
    alert(`อัปโหลดสำเร็จ!\nURL: ${result.url}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🧪 ทดสอบ Cloudinary Upload
          </h1>
          <p className="text-gray-600">
            ลากรูปมาวาง หรือคลิกเพื่อเลือกไฟล์ เพื่อทดสอบการอัปโหลดไป Cloudinary
          </p>
        </div>

        {/* Test Upload for Products */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📦 อัปโหลดรูปสินค้า</h2>
          <ImageUploader 
            folder="products" 
            maxFiles={5}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>

        {/* Test Upload for General */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🖼️ อัปโหลดรูปทั่วไป</h2>
          <ImageUploader 
            folder="general" 
            maxFiles={1}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            📋 ข้อมูล Cloudinary Features
          </h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>✅ Auto optimization (WebP, AVIF)</li>
            <li>✅ Auto resize เหลือ 800×600 (max)</li>
            <li>✅ Quality auto adjustment</li>
            <li>✅ CDN delivery</li>
            <li>✅ ขีดจำกัด 5MB ต่อไฟล์</li>
            <li>✅ รองรับ JPG, PNG, WebP, GIF</li>
          </ul>
        </div>
      </div>
    </div>
  );
}