import Link from 'next/link';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center space-x-2">
                <div className="text-2xl">🐠</div>
                <span className="text-xl font-bold text-gray-900">
                  Admin Panel
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link 
                href="/admin" 
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/admin/products" 
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                จัดการสินค้า
              </Link>
              <Link 
                href="/admin/categories" 
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                หมวดหมู่
              </Link>
              <Link 
                href="/admin/orders" 
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                คำสั่งซื้อ
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-gray-500 hover:text-gray-900 text-sm"
              >
                ดูเว็บไซต์
              </Link>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition-colors">
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t bg-gray-50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/admin" 
              className="block px-3 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/products" 
              className="block px-3 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md text-sm font-medium"
            >
              จัดการสินค้า
            </Link>
            <Link 
              href="/admin/categories" 
              className="block px-3 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md text-sm font-medium"
            >
              หมวดหมู่
            </Link>
            <Link 
              href="/admin/orders" 
              className="block px-3 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md text-sm font-medium"
            >
              คำสั่งซื้อ
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            © 2025 Earth Betta Shop Admin Panel
          </p>
        </div>
      </footer>
    </div>
  );
}