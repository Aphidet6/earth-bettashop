import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/supabase';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/products/[id] - ดึงสินค้าตาม ID
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await ProductService.getProductById(productId);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get Product API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - อัปเดตสินค้า
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const body = await request.json();

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await ProductService.updateProduct(productId, body);

    if (!product) {
      return NextResponse.json(
        { error: 'Failed to update product or product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Update Product API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - ลบสินค้า
export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await ProductService.deleteProduct(productId);

    if (!product) {
      return NextResponse.json(
        { error: 'Failed to delete product or product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete Product API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}