import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload function with optimization
export const uploadImage = async (file: File, folder: string = 'general') => {
  try {
    // Debug: Check environment variables
    console.log('🔧 Cloudinary Config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '***exists***' : 'missing',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '***exists***' : 'missing',
    });

    // Convert file to base64
    const fileBuffer = await file.arrayBuffer();
    const mime = file.type;
    const encoding = 'base64';
    const base64Data = Buffer.from(fileBuffer).toString('base64');
    const fileUri = 'data:' + mime + ';' + encoding + ',' + base64Data;

    console.log('📤 Uploading to Cloudinary:', { 
      fileName: file.name, 
      fileSize: file.size, 
      folder 
    });

    // Upload to Cloudinary with optimizations
    const result = await cloudinary.uploader.upload(fileUri, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        {
          width: 800,
          height: 600,
          crop: 'limit', // ไม่ crop แต่จำกัดขนาด
          quality: 'auto', // คุณภาพอัตโนมัติ
          format: 'auto', // format อัตโนมัติ (webp, avif)
        },
      ],
    });

    console.log('✅ Upload successful:', {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

// Delete function
export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: true, result };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return { success: false, error };
  }
};

export default cloudinary;