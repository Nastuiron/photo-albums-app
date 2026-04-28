import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/current-user';
import { NextResponse } from 'next/server';

type Params = {
  params: Promise<{ albumId: string }>;
};

type ReorderPhotoInput = {
  id: string;
  position: number;
};

function isReorderPhotoInput(value: unknown): value is ReorderPhotoInput {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return typeof item.id === 'string' && typeof item.position === 'number';
}

export async function PATCH(req: Request, { params }: Params) {
  const user = await getCurrentUser();
  const { albumId } = await params;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const album = await prisma.album.findFirst({
    where: {
      id: albumId,
      userId: user.id,
    },
  });

  if (!album) {
    return NextResponse.json({ error: 'Album not found' }, { status: 404 });
  }

  const body: unknown = await req.json();

  if (typeof body !== 'object' || body === null || !('photos' in body)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const { photos } = body as { photos: unknown };

  if (!Array.isArray(photos) || !photos.every(isReorderPhotoInput)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const queries = photos.map((photo) =>
    prisma.photo.update({
      where: {
        id: photo.id,
        albumId,
      },
      data: {
        position: photo.position,
      },
    }),
  );

  await prisma.$transaction(queries);

  return NextResponse.json({ success: true });
}
