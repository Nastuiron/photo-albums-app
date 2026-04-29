import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getStoredFile } from '@/lib/storage';

type Params = {
  params: Promise<{
    photoId: string;
  }>;
};

export async function GET(req: Request, { params }: Params) {
  const { photoId } = await params;
  const { searchParams } = new URL(req.url);

  const token = searchParams.get('token');
  const download = searchParams.get('download') === '1';
  const variant = searchParams.get('variant') ?? 'large';

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }

  const photo = await prisma.photo.findFirst({
    where: {
      id: photoId,
      album: {
        shareToken: token,
        isShared: true,
      },
    },
    include: {
      album: true,
    },
  });

  if (!photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
  }

  const storageKey =
    download || variant === 'original'
      ? photo.storageKeyOriginal
      : variant === 'thumbnail'
        ? (photo.storageKeyThumbnail ??
          photo.storageKeyLarge ??
          photo.storageKeyOriginal)
        : (photo.storageKeyLarge ?? photo.storageKeyOriginal);

  try {
    const file = await getStoredFile(storageKey);

    return new NextResponse(new Uint8Array(file.buffer), {
      headers: {
        'Content-Type': file.contentType,
        ...(download
          ? {
              'Content-Disposition': `attachment; filename="${encodeURIComponent(
                photo.originalName,
              )}"`,
            }
          : {}),
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
