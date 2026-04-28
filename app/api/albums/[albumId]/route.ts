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
  const { title, description, isShared, coverPhotoId } = body;

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

  if (coverPhotoId) {
    const photo = await prisma.photo.findFirst({
      where: {
        id: coverPhotoId,
        albumId,
      },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Cover photo not found in this album' },
        { status: 400 },
      );
    }
  }

  const album = await prisma.album.update({
    where: { id: albumId },
    data: {
      title: title ?? existingAlbum.title,
      description:
        typeof description === 'string'
          ? description
          : existingAlbum.description,
      isShared:
        typeof isShared === 'boolean' ? isShared : existingAlbum.isShared,
      coverPhotoId:
        typeof coverPhotoId === 'string'
          ? coverPhotoId
          : existingAlbum.coverPhotoId,
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
