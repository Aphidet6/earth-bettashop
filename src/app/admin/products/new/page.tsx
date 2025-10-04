// Client-side page for creating a new product.
// Responsibilities:
// - Allow admin/seller to upload an image (handled by /api/upload)
// - Collect product metadata and send POST /api/products
// - Provide form validation and user feedback (loading states)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Category } from '@/lib/supabase';

interface FormData {
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
  category_id: string;
  is_active: boolean;
  image_url: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    is_active: true,
    image_url: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // We use a FormData POST to /api/upload (server-side route that
    // proxies/uploads to Cloudinary or other storage). The response
    // should include the uploaded image URL which we save into formData.
    setImageUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image_url: data.data.secure_url }));
      } else {
        alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock_quantity) {
      alert('กรุณากรอกข้อมูลที่จำเป็น');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        is_active: formData.is_active,
        image_url: formData.image_url || null
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (data.success) {
        alert('เพิ่มสินค้าสำเร็จ!');
        router.push('/admin/products');
      } else {
        alert('เกิดข้อผิดพลาดในการเพิ่มสินค้า: ' + data.error);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มสินค้า');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link 
            href="/admin/products"
            className="text-gray-600 hover:text-gray-900"
          >
            ← กลับไปยังรายการสินค้า
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">เพิ่มสินค้าใหม่</h1>
        <p className="text-gray-600 mt-2">กรอกข้อมูลสินค้าที่ต้องการเพิ่ม</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รูปภาพสินค้า
            </label>
            <div className="flex items-center space-x-4">
              {formData.image_url ? (
                <div className="relative">
                  <img 
                    src={formData.image_url} 
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-4xl">📷</span>
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageUploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {imageUploading && <p className="text-sm text-blue-600 mt-1">กำลังอัปโหลด...</p>}
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อสินค้า *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น ปลากัดหางพัด สีแดง"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รายละเอียด
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="อธิบายรายละเอียดของสินค้า..."
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ราคา (บาท) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                จำนวนในสต็อก *
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมวดหมู่
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- เลือกหมวดหมู่ --</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              เปิดขายสินค้านี้
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading || imageUploading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}
            </button>
            <Link
              href="/admin/products"
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors text-center"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}