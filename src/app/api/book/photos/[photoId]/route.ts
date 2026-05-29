import { getCurrentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
import { deleteBookPhoto } from '@/lib/storage';
import { NextResponse } from 'next/server';

type Params = {
  params: Promise<{
    photoId: string;
  }>;
};

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getCurrentUser();
  const { photoId } = await params;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const photo = await prisma.bookPhoto.findFirst({
    where: {
      id: photoId,
      book: {
        userId: user.id,
      },
    },
  });

  if (!photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
  }

  await deleteBookPhoto({
    original: photo.storageKeyOriginal,
    thumbnail: photo.storageKeyThumbnail,
  });

  await prisma.bookPhoto.delete({
    where: { id: photo.id },
  });

  return NextResponse.json({ success: true });
}
