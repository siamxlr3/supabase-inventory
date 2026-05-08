import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

const BUCKET_NAME = 'product-images';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: 'Invalid file type. Use JPEG, PNG, WebP, or GIF.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'File too large. Max 5MB.' }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = `products/${fileName}`;

    // Convert File to ArrayBuffer then to Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase Storage Error:', error);
      logger.error('Image upload failed', error);
      return NextResponse.json({ 
        success: false, 
        message: error.message,
        details: error
      }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: urlData.publicUrl,
        path: filePath,
      }
    }, { status: 201 });
  } catch (error: any) {
    logger.error('Image upload error', error);
    return NextResponse.json({ success: false, message: error.message || 'Upload failed' }, { status: 500 });
  }
}
