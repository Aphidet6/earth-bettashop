import React from 'react'
import ProductCard from '@/components/ui/ProductCard'
import { ProductService } from '@/lib/supabase'

export default async function ProductsPage() {
  // ดึงข้อมูลจาก Supabase
  const products = await ProductService.getAllProducts();
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            สินค้าทั้งหมด
          </h1>
          <p className="text-gray-600">
            ปลากัดคุณภาพสูง เลือกสรรมาเป็นพิเศษ
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 max-w-7xl mx-auto">
          {products ? products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              category={product.category?.name || 'ไม่ระบุ'}
              imageUrl={product.image_url}
            />
          )) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">ไม่พบสินค้า</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
