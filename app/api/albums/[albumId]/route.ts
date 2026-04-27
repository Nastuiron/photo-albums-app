import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/current-user';
import { createSlug } from '@/lib/slug';
import { NextResponse } from 'next/server';
import { deleteAlbumDirectory } from '@/lib/storage';

type Params = {
  params: Promise<{
    albumId: string;
  }>;
};

export async function GET(_req: Request, { params }: Params) {
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
    include: {
      photos: {
        orderBy: { position: 'asc' },
      },
    },
  });

  if (!album) {
    return NextResponse.json({ error: 'Album not found' }, { status: 404 });
  }

  return NextResponse.json({ album });
}

export async function PATCH(req: Request, { params }: Params) {
  const user = await getCurrentUser();
  const { albumId } = await params;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existingAlbum = await prisma.album.findFirst({
    where: {
      id: albumId,
      userId: user.id,
    },
  });

  if (!existingAlbum) {
    return NextResponse.json({ error: 'Album not found' }, { status: 404 });
  }

  const body = await req.json();
  const { title, description, isShared } = body;

  let slug = existingAlbum.slug;

  if (title && title !== existingAlbum.title) {
    const baseSlug = createSlug(title);
    slug = baseSlug;
    let counter = 1;

    while (
      await prisma.album.findFirst({
        where: {
          userId: user.id,
          slug,
          NOT: {
            id: albumId,
          },
        },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  const album = await prisma.album.update({
    where: { id: albumId },
    data: {
      title: title ?? existingAlbum.title,
      description,
      isShared:
        typeof isShared === 'boolean' ? isShared : existingAlbum.isShared,
      slug,
    },
  });

  return NextResponse.json({ album });
}

export async function DELETE(_req: Request, { params }: Params) {
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

  await deleteAlbumDirectory(albumId);

  await prisma.album.delete({
    where: { id: albumId },
  });

  return NextResponse.json({ success: true });
}
