import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/current-user';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

type Params = {
  params: Promise<{
    albumId: string;
  }>;
};

export async function POST(_req: Request, { params }: Params) {
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

  const updatedAlbum = await prisma.album.update({
    where: { id: albumId },
    data: {
      shareToken: crypto.randomBytes(32).toString('hex'),
    },
  });

  return NextResponse.json({ album: updatedAlbum });
}
