import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/lib/supabase';

// GET /api/categories - ดึง categories ทั้งหมด
export async function GET() {
  try {
    const categories = await CategoryService.getAllCategories();

    if (!categories) {
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length
    });

  } catch (error) {
    console.error('Categories API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}