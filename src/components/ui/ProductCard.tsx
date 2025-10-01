import React from 'react'
import Image from 'next/image'
import Link from 'next/link';

interface ProductCardProps {
  id?: number;
  name?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
}

function ProductCard({ 
  id = 1, 
  name = "Product name", 
  price = 500, 
  category = "HMPK",
  imageUrl 
}: ProductCardProps) {
  return (
    <div className='bg-white rounded-xl shadow-md p-3 w-full max-w-sm hover:shadow-lg transition-shadow'>
      <div className='flex items-center justify-start mb-2'>
        <div className='bg-blue-500 text-white text-xs px-2 py-1 rounded-full'>
          {category || <span>No Category</span>}
        </div>
      </div>
    <div className='relative h-40 w-full bg-gray-200 rounded-lg overflow-hidden mb-3'>
        {imageUrl ? (
          <Image 
            src={imageUrl}
            alt={name || 'Product Image'}
            fill
            className='object-cover'
            />
        ) : (
          <div className='absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200'>
            <div className='text-blue-400 text-8xl opacity-50'>🐠</div>
          </div>
        )}
    </div>
    <div className='mb-2'>
        <h2 className='text-base font-semibold text-gray-800 line-clamp-2'>{name}</h2>
    </div>
    <div className='mb-3'>
        <p className='text-lg font-bold text-blue-600'>฿ {price?.toLocaleString()}</p>
    </div>
    <div className='flex gap-3 justify-center'>
        <Link href={`/products/${id}`}>
          <button className='cursor-pointer w-30 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-2 rounded-lg text-xs transition-colors'>
            View Details
          </button>
        </Link>
        <Link href={`/cart`}>
            <button className='cursor-pointer w-30 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs transition-colors'>
            Add to Cart
            </button>
        </Link>
        
    </div>
  </div>
)}

export default ProductCard
