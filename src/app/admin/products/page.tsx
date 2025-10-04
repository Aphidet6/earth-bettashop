// This is a client-side admin page for listing and managing products.
// Responsibilities:
// - Fetch the list of products from the backend API (/api/products)
// - Show loading / error states
// - Provide actions: view, edit, delete, and create new product
// Notes:
// - This file runs in the browser ("use client") because it uses hooks and
//   browser-only APIs like confirm() and fetch.
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/supabase';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      // The API returns a shape like { success: true, data: [...] }
      // We store the raw product array into local state for rendering.
      if (data.success) {
        setProducts(data.data);
      } else {
        setError('ไม่สามารถดึงข้อมูลสินค้าได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`คุณต้องการลบสินค้า "${name}" ใช่หรือไม่?`)) {
      return;
    }
    // Call DELETE /api/products/:id then refresh the list on success.
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('ลบสินค้าสำเร็จ!');
        fetchProducts(); // รีเฟรชรายการ
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

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการสินค้า</h1>
          <p className="text-gray-600 mt-2">จำนวนสินค้าทั้งหมด: {products.length} รายการ</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>เพิ่มสินค้าใหม่</span>
        </Link>
      </div>

      {/* Products Table */}
      {/*
        - Renders a responsive table of products
        - Each row contains quick actions (view/edit/delete)
        - Images are rendered with a fallback placeholder
      */}
      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">ยังไม่มีสินค้า</h3>
          <p className="text-gray-600 mb-4">เริ่มต้นด้วยการเพิ่มสินค้าแรกของคุณ</p>
          <Link 
            href="/admin/products/new"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            เพิ่มสินค้าใหม่
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สินค้า
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    หมวดหมู่
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ราคา
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สต็อก
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="text-gray-400 text-lg">🐠</span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category?.name || 'ไม่ระบุ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ฿{product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.is_active ? 'เปิดขาย' : 'ปิดขาย'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link 
                        href={`/admin/products/${product.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        ดู
                      </Link>
                      <Link 
                        href={`/admin/products/${product.id}/edit`}
                        className="text-green-600 hover:text-green-900"
                      >
                        แก้ไข
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}