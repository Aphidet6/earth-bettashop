'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // ดึงจำนวนสินค้า
        const productsRes = await fetch('/api/products');
        const productsData = await productsRes.json();
        
        // ดึงจำนวนหมวดหมู่
        const categoriesRes = await fetch('/api/categories');
        const categoriesData = await categoriesRes.json();

        setStats({
          totalProducts: productsData.count || 0,
          totalCategories: categoriesData.count || 0,
          totalOrders: 12, // Mock data
          totalRevenue: 15750 // Mock data
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'จำนวนสินค้า',
      value: stats.totalProducts,
      icon: '📦',
      color: 'bg-blue-500',
      link: '/admin/products'
    },
    {
      title: 'หมวดหมู่',
      value: stats.totalCategories,
      icon: '📂',
      color: 'bg-green-500',
      link: '/admin/categories'
    },
    {
      title: 'คำสั่งซื้อ',
      value: stats.totalOrders,
      icon: '📋',
      color: 'bg-yellow-500',
      link: '/admin/orders'
    },
    {
      title: 'ยอดขาย',
      value: `฿${stats.totalRevenue.toLocaleString()}`,
      icon: '💰',
      color: 'bg-purple-500',
      link: '/admin/reports'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">ภาพรวมของร้านค้า Earth Betta Shop</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <Link key={index} href={card.link}>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`${card.color} text-white p-3 rounded-full text-2xl`}>
                  {card.icon}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">การจัดการด่วน</h2>
          <div className="space-y-3">
            <Link 
              href="/admin/products/new"
              className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="text-2xl mr-3">➕</div>
              <div>
                <h3 className="font-medium text-gray-900">เพิ่มสินค้าใหม่</h3>
                <p className="text-sm text-gray-500">เพิ่มปลากัดหรือสินค้าใหม่</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/products"
              className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="text-2xl mr-3">📝</div>
              <div>
                <h3 className="font-medium text-gray-900">จัดการสินค้า</h3>
                <p className="text-sm text-gray-500">แก้ไขหรือลบสินค้า</p>
              </div>
            </Link>

            <Link 
              href="/admin/orders"
              className="flex items-center p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <div className="text-2xl mr-3">📦</div>
              <div>
                <h3 className="font-medium text-gray-900">ตรวจสอบคำสั่งซื้อ</h3>
                <p className="text-sm text-gray-500">ดูและจัดการคำสั่งซื้อ</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">กิจกรรมล่าสุด</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-xl">✅</div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">เพิ่มสินค้า "ปลากัดหางพัดสีแดง" สำเร็จ</p>
                <p className="text-xs text-gray-500">5 นาทีที่แล้ว</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-blue-500 text-xl">📦</div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">มีคำสั่งซื้อใหม่ #12345</p>
                <p className="text-xs text-gray-500">10 นาทีที่แล้ว</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-purple-500 text-xl">💰</div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">ยอดขายวันนี้ ฿2,500</p>
                <p className="text-xs text-gray-500">1 ชั่วโมงที่แล้ว</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}