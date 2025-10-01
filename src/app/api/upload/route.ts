import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { error: 'ไม่พบไฟล์ที่จะอัปโหลด' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น' },
        { status: 400 }
      );
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ไฟล์ต้องมีขนาดไม่เกิน 5MB' },
        { status: 400 }
      );
    }

    console.log('อัปโหลดไฟล์:', file.name, 'ขนาด:', file.size, 'bytes');

    // Upload to Cloudinary
    const result = await uploadImage(file, folder);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'อัปโหลดไฟล์ไม่สำเร็จ' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'อัปโหลดสำเร็จ!',
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    });

  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปโหลด' },
      { status: 500 }
    );
  }
}

// GET method สำหรับทดสอบ
export async function GET() {
  return NextResponse.json({
    message: 'Upload API พร้อมใช้งาน',
    methods: ['POST'],
    maxSize: '5MB',
    supportedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  });
}