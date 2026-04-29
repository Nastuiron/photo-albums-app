import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
import AlbumDetailClient from './album-detail-client';

type Props = {
  params: Promise<{
    albumId: string;
  }>;
};

export default async function AlbumDetailPage({ params }: Props) {
  const user = await getCurrentUser();
  const { albumId } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';

  if (!user) {
    redirect('/login');
  }

  const album = await prisma.album.findFirst({
    where: {
      id: albumId,
      userId: user.id,
    },
    include: {
      photos: {
        orderBy: { position: 'asc' },
      },
    },
  });

  if (!album) {
    redirect('/dashboard');
  }

  return <AlbumDetailClient album={album} appUrl={appUrl} />;
}
