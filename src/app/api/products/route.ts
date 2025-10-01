import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/supabase';

// GET /api/products - ดึงสินค้าทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');

    let products;
    
    if (categoryId) {
      // ดึงสินค้าตาม category
      products = await ProductService.getProductsByCategory(parseInt(categoryId));
    } else {
      // ดึงสินค้าทั้งหมด
      products = await ProductService.getAllProducts();
    }

    if (!products) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error) {
    console.error('Products API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/products - เพิ่มสินค้าใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }

    const product = await ProductService.createProduct({
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      stock_quantity: body.stock_quantity || 0,
      category_id: body.category_id,
      image_url: body.image_url,
      gallery: body.gallery,
      cloudinary_public_id: body.cloudinary_public_id,
      is_active: body.is_active !== false, // default true
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create Product API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}