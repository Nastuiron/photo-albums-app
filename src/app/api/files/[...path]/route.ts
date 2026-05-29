import { getStoredFile } from '@/lib/storage';
import { getCurrentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type Params = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(_req: Request, { params }: Params) {
  const user = await getCurrentUser();
  const { path } = await params;
  const storageKey = path.join('/');

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const photo = await prisma.photo.findFirst({
    where: {
      OR: [
        { storageKeyOriginal: storageKey },
        { storageKeyLarge: storageKey },
        { storageKeyThumbnail: storageKey },
      ],
    },
    select: {
      album: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!photo || photo.album.userId !== user.id) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  try {
    const file = await getStoredFile(storageKey);

    return new NextResponse(new Uint8Array(file.buffer), {
      headers: {
        'Content-Type': file.contentType,
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
