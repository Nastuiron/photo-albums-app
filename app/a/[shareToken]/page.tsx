import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PublicAlbumClient from './public-album-client';

type Props = {
  params: Promise<{
    shareToken: string;
  }>;
};

export default async function PublicAlbumPage({ params }: Props) {
  const { shareToken } = await params;

  const album = await prisma.album.findFirst({
    where: {
      shareToken,
      isShared: true,
    },
    include: {
      photos: {
        orderBy: {
          position: 'asc',
        },
        select: {
          id: true,
          originalName: true,
          storageKeyOriginal: true,
          mimeType: true,
          storageKeyLarge: true,
          storageKeyThumbnail: true,
        },
      },
    },
  });

  if (!album) {
    notFound();
  }

  return (
    <PublicAlbumClient
      album={{
        id: album.id,
        title: album.title,
        description: album.description,
        shareToken: album.shareToken,
        photos: album.photos,
      }}
    />
  );
}
