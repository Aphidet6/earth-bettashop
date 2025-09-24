import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link 
              href="/" 
              className="flex-shrink-0 flex items-center"
            >
              <h1 className="text-xl font-bold text-gray-900">
                Earth BettaShop
              </h1>
            </Link>
            
            <nav className="hidden md:flex space-x-8 ml-8">
              <Link 
                href="/products" 
                className="flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-700"
              >
                สินค้า
              </Link>
              <Link 
                href="/about" 
                className="flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                เกี่ยวกับเรา
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/cart" 
              className="text-gray-600 hover:text-gray-900"
            >
              ตะกร้า
            </Link>
            <Link 
              href="/auth" 
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}