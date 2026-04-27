import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/current-user';
import { deleteAlbumPhoto } from '@/lib/storage';
import { NextResponse } from 'next/server';

type Params = {
  params: Promise<{
    albumId: string;
    photoId: string;
  }>;
};

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getCurrentUser();
  const { albumId, photoId } = await params;

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

  const photo = await prisma.photo.findFirst({
    where: {
      id: photoId,
      albumId,
    },
  });

  if (!photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
  }

  await deleteAlbumPhoto({
    original: photo.storageKeyOriginal,
    large: photo.storageKeyLarge,
    thumbnail: photo.storageKeyThumbnail,
  });

  await prisma.photo.delete({
    where: { id: photoId },
  });

  return NextResponse.json({ success: true });
}
