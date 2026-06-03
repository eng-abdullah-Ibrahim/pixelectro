import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('mediaFiles') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploaded: { url: string; publicId: string; type: string }[] = [];

    for (const file of files) {
      if (!file || file.size === 0) continue;

      const isVideo = file.type.startsWith('video/');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary via stream
      const result = await new Promise<{ secure_url: string; public_id: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'pixelectro/projects',
              resource_type: isVideo ? 'video' : 'image',
              quality: 'auto',
              fetch_format: 'auto',
            },
            (error, result) => {
              if (error || !result) reject(error ?? new Error('Upload failed'));
              else resolve(result as { secure_url: string; public_id: string });
            }
          );
          stream.end(buffer);
        }
      );

      uploaded.push({
        url: result.secure_url,
        publicId: result.public_id,
        type: isVideo ? 'VIDEO' : 'IMAGE',
      });
    }

    return NextResponse.json({ success: true, files: uploaded });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Upload failed';
    console.error('Upload error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { publicId, resourceType } = await request.json() as {
      publicId: string;
      resourceType?: string;
    };

    if (!publicId) {
      return NextResponse.json({ error: 'Missing publicId' }, { status: 400 });
    }

    await cloudinary.uploader.destroy(publicId, {
      resource_type: (resourceType === 'video' ? 'video' : 'image') as 'video' | 'image',
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Delete failed';
    console.error('Cloudinary delete error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
