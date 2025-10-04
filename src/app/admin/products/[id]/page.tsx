// Client-side admin product detail page.
// Responsibilities:
// - Display product information (image, price, stock, timestamps)
// - Provide quick actions: edit, delete, view public product page
// - Uses GET /api/products/:id to fetch fresh data
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/lib/supabase';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.data);
      } else {
        setError('ไม่พบสินค้าที่ต้องการ');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !confirm(`คุณต้องการลบสินค้า "${product.name}" ใช่หรือไม่?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('ลบสินค้าสำเร็จ!');
        window.location.href = '/admin/products';
      } else {
        alert('เกิดข้อผิดพลาดในการลบสินค้า');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('เกิดข้อผิดพลาดในการลบสินค้า');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || 'ไม่พบสินค้าที่ต้องการ'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link 
            href="/admin/products"
            className="text-gray-600 hover:text-gray-900"
          >
            ← กลับไปยังรายการสินค้า
          </Link>
          <div className="flex space-x-2">
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ✏️ แก้ไข
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🗑️ ลบ
            </button>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        <div className="flex items-center space-x-4 mt-2">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
            product.is_active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {product.is_active ? '🟢 เปิดขาย' : '🔴 ปิดขาย'}
          </span>
          {product.category && (
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
              📂 {product.category.name}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Image */}
          <div className="md:w-1/2">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-6xl">🐠</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:w-1/2 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">รายละเอียดสินค้า</h2>
            
            <div className="space-y-4">
              {/* Price */}
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-lg font-semibold text-gray-700">ราคา:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ฿{product.price.toLocaleString()}
                </span>
              </div>

              {/* Stock */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-lg font-semibold text-gray-700">จำนวนในสต็อก:</span>
                <span className={`text-lg font-bold ${
                  product.stock_quantity > 10 
                    ? 'text-green-600' 
                    : product.stock_quantity > 0 
                    ? 'text-orange-600' 
                    : 'text-red-600'
                }`}>
                  {product.stock_quantity} ชิ้น
                </span>
              </div>

              {/* Category */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-lg font-semibold text-gray-700">หมวดหมู่:</span>
                <span className="text-lg text-gray-600">
                  {product.category?.name || 'ไม่ระบุ'}
                </span>
              </div>

              {/* Created Date */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-lg font-semibold text-gray-700">วันที่เพิ่ม:</span>
                <span className="text-lg text-gray-600">
                  {new Date(product.created_at).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {/* Updated Date */}
              {product.updated_at !== product.created_at && (
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-lg font-semibold text-gray-700">แก้ไขล่าสุด:</span>
                  <span className="text-lg text-gray-600">
                    {new Date(product.updated_at).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="px-6 pb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">รายละเอียด</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <Link
            href="/admin/products"
            className="text-gray-600 hover:text-gray-900"
          >
            ← กลับไปยังรายการสินค้า
          </Link>
          <div className="flex space-x-2">
            <Link
              href={`/products/${product.id}`}
              target="_blank"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              👁️ ดูหน้าสินค้า
            </Link>
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ✏️ แก้ไขสินค้า
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}