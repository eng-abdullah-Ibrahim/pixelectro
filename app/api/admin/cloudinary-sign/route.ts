import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Accept optional folder param from the widget
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'pixelectro/assets';

    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = { timestamp, folder };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      timestamp,
      signature,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Also support POST (next-cloudinary calls POST)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    
    // next-cloudinary typically passes all parameters that need signing in `body.paramsToSign`.
    // We explicitly extract them.
    const paramsToSign: Record<string, any> = body.paramsToSign ? { ...body.paramsToSign } : { ...body };
    
    // Remove params that shouldn't be signed or will be overridden
    delete paramsToSign.api_key;
    delete paramsToSign.signature;
    delete paramsToSign.cloud_name;

    // Ensure timestamp and folder are set (but prefer the ones sent by the widget)
    if (!paramsToSign.timestamp) paramsToSign.timestamp = Math.round(new Date().getTime() / 1000);
    if (!paramsToSign.folder) paramsToSign.folder = 'pixelectro/assets';

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      timestamp: paramsToSign.timestamp,
      signature,
      folder: paramsToSign.folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
