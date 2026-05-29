import { getCurrentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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

export async function PATCH(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const book = await prisma.book.findUnique({
    where: { userId: user.id },
  });

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
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
    prisma.bookPhoto.update({
      where: {
        id: photo.id,
        bookId: book.id,
      },
      data: {
        position: photo.position,
      },
    }),
  );

  await prisma.$transaction(queries);

  return NextResponse.json({ success: true });
}
