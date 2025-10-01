import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ProductService } from '@/lib/supabase';

// ดึงข้อมูลสินค้าจาก Supabase
async function getProduct(id: string) {
  const productId = parseInt(id);
  if (isNaN(productId)) return null;
  
  return await ProductService.getProductById(productId);
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound(); // แสดงหน้า 404
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2">
              <div className="relative h-96 w-full bg-gray-200 overflow-hidden">
                {product.image_url ? (
                  <Image 
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-blue-300 text-9xl opacity-40">🐠</div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 p-8">
              {/* Category Badge */}
              <div className="mb-4">
                <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">
                  {product.category?.name || 'ไม่ระบุ'}
                </span>
              </div>

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-blue-600">
                  ฿ {product.price.toLocaleString()}
                </span>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">รายละเอียดสินค้า</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                  เพิ่มลงตะกร้า
                </button>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors">
                  ซื้อทันที
                </button>
              </div>

              {/* Product Info */}
              <div className="mt-8 border-t pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">รหัสสินค้า:</span>
                    <span className="ml-2 font-medium">#{product.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">หมวดหมู่:</span>
                    <span className="ml-2 font-medium">{product.category?.name || 'ไม่ระบุ'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">สินค้าที่เกี่ยวข้อง</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* ProductCard components สำหรับสินค้าที่เกี่ยวข้อง */}
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate metadata สำหรับ SEO
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} - Earth Betta Shop`,
    description: product.description,
  };
}