import { prisma } from '@/lib/prisma';
import { getStoredFile } from '@/lib/storage';
import { NextResponse } from 'next/server';

type Params = {
  params: Promise<{
    photoId: string;
  }>;
};

export async function GET(req: Request, { params }: Params) {
  const { photoId } = await params;
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const variant = searchParams.get('variant') === 'image' ? 'image' : 'thumb';

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }

  const photo = await prisma.bookPhoto.findFirst({
    where: {
      id: photoId,
      book: {
        shareToken: token,
      },
    },
  });

  if (!photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
  }

  const storageKey =
    variant === 'image' ? photo.storageKeyOriginal : photo.storageKeyThumbnail;

  try {
    const file = await getStoredFile(storageKey);

    return new NextResponse(new Uint8Array(file.buffer), {
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Type': file.contentType,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
