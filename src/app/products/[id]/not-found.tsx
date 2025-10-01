import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🐠</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          ไม่พบสินค้าที่ต้องการ
        </h1>
        <p className="text-gray-600 mb-8">
          ขออภัย สินค้าที่คุณกำลังมองหาอาจถูกลบหรือย้ายแล้ว
        </p>
        <div className="space-x-4">
          <Link 
            href="/products"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            ดูสินค้าทั้งหมด
          </Link>
          <Link 
            href="/"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}