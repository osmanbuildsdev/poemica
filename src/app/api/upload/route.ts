import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import { adminStorage } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';


export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  console.log('🔥 Firebase Upload API called');
  console.log('📋 Environment check:', {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing',
    projectId: process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'
  });
  
  try {

    const session = await getServerSession(authOptions);
    console.log('👤 Session:', session ? `✅ User: ${session.user?.email}` : '❌ No session');
    
    if (!session || !session.user) {
      console.log('🚫 Authentication failed');
      return NextResponse.json(
        { error: 'Dosya yüklemek için giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    console.log('📦 Getting form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    
    console.log('📄 File details:', {
      name: file ? file.name : 'null',
      size: file ? `${(file.size / 1024 / 1024).toFixed(2)}MB` : 'null',
      type: file ? file.type : 'null',
      uploadType: type
    });
    
    if (!file) {
      console.log('❌ No file provided');
      return NextResponse.json(
        { error: 'Dosya seçilmedi' },
        { status: 400 }
      );
    }


    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Sadece resim dosyaları yüklenebilir (JPEG, PNG, GIF, WebP)' },
        { status: 400 }
      );
    }
    

    const maxSize = type === 'profile' ? 3 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const limitText = type === 'profile' ? '3MB' : '10MB';
      console.log('❌ File too large:', `${(file.size / 1024 / 1024).toFixed(2)}MB`, 'Max:', limitText);
      return NextResponse.json(
        { error: `Dosya boyutu ${limitText}'dan küçük olmalıdır` },
        { status: 400 }
      );
    }

    console.log('🔧 Creating filename...');

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${uniqueSuffix}.${extension}`;
    

    let storagePath: string;
    if (type === 'profile') {
      storagePath = `profile/${filename}`;
    } else if (type === 'poem-cover') {
      storagePath = `poem-covers/${filename}`;
    } else {
      storagePath = `uploads/${filename}`;
    }

    console.log('📤 Uploading to Firebase Storage:', storagePath);


    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(storagePath);
    
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        customMetadata: {
          uploadedBy: session.user.email || 'unknown',
          uploadedAt: new Date().toISOString(),
          originalName: file.name
        }
      }
    });
    await fileRef.makePublic();
    

    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    

    const alternativeURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${storagePath.replace(/\//g, '%2F')}?alt=media`;
    
    return NextResponse.json({ 
      url: downloadURL,
      alternativeUrl: alternativeURL,
      success: true,
      fileName: filename,
      path: storagePath,
      bucket: bucket.name
    });
  } catch (error) {
    console.error('💥 Upload error details:', error);
    console.error('📚 Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        error: 'Dosya yüklenirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}