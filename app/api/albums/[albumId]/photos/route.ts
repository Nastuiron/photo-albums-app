import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/current-user';
import { saveAlbumPhoto } from '@/lib/storage';
import { NextResponse } from 'next/server';
import { Photo } from '@prisma/client';

type Params = {
  params: Promise<{
    albumId: string;
  }>;
};

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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
  });

  if (!album) {
    return NextResponse.json({ error: 'Album not found' }, { status: 404 });
  }

  const photos = await prisma.photo.findMany({
    where: { albumId },
    orderBy: { position: 'asc' },
  });

  return NextResponse.json({ photos });
}

export async function POST(req: Request, { params }: Params) {
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

  const formData = await req.formData();
  const files = formData.getAll('photos') as File[];

  if (!files || files.length === 0) {
    return NextResponse.json(
      { error: 'Aucun fichier fourni' },
      { status: 400 },
    );
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Maximum ${MAX_FILES} fichiers autorisés` },
      { status: 400 },
    );
  }

  const currentCount = await prisma.photo.count({
    where: { albumId },
  });

  const createdPhotos: Photo[] = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Type non autorisé: ${file.type}` },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `${file.name} dépasse 5MB` },
        { status: 400 },
      );
    }

    let saved;

    try {
      saved = await saveAlbumPhoto({
        albumId,
        file,
      });
    } catch {
      return NextResponse.json(
        { error: 'Fichier corrompu ou invalide' },
        { status: 400 },
      );
    }

    const photo = await prisma.photo.create({
      data: {
        albumId,
        filename: saved.filename,
        originalName: file.name,
        mimeType: 'image/webp',
        size: saved.size,
        width: saved.width,
        height: saved.height,
        storageKeyOriginal: saved.storageKeyOriginal,
        storageKeyLarge: saved.storageKeyLarge,
        storageKeyThumbnail: saved.storageKeyThumbnail,
        position: currentCount + createdPhotos.length,
      },
    });

    createdPhotos.push(photo);
  }

  return NextResponse.json({ photos: createdPhotos }, { status: 201 });
}
