import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Earth BettaShop</h3>
            <p className="text-gray-300">
              ร้านจำหน่ายปลากัดคุณภาพสูง และอุปกรณ์เลี้ยงปลา
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">ลิงก์ด่วน</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/products" className="hover:text-white">สินค้า</a></li>
              <li><a href="/about" className="hover:text-white">เกี่ยวกับเรา</a></li>
              <li><a href="/contact" className="hover:text-white">ติดต่อเรา</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">ติดต่อเรา</h3>
            <ul className="space-y-2 text-gray-300">
              <li>อีเมล: info@earthbettashop.com</li>
              <li>โทรศัพท์: 02-123-4567</li>
              <li>ไลน์: @earthbettashop</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; 2025 Earth BettaShop. สงวนลิขสิทธิ์.</p>
        </div>
      </div>
    </footer>
  );
}