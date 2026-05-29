import { BookPhoto } from '@prisma/client';
import { getCurrentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
import { saveBookPhoto } from '@/lib/storage';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const book = await prisma.book.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      shareToken: crypto.randomBytes(32).toString('hex'),
    },
    update: {},
  });

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

  const currentCount = await prisma.bookPhoto.count({
    where: { bookId: book.id },
  });

  const createdPhotos: BookPhoto[] = [];

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
        { error: `${file.name} dépasse 8MB` },
        { status: 400 },
      );
    }

    let saved;

    try {
      saved = await saveBookPhoto({
        bookId: book.id,
        file,
      });
    } catch {
      return NextResponse.json(
        { error: 'Fichier corrompu ou invalide' },
        { status: 400 },
      );
    }

    const photo = await prisma.bookPhoto.create({
      data: {
        bookId: book.id,
        filename: saved.filename,
        originalName: file.name,
        mimeType: 'image/webp',
        size: saved.size,
        width: saved.width,
        height: saved.height,
        storageKeyOriginal: saved.storageKeyOriginal,
        storageKeyThumbnail: saved.storageKeyThumbnail,
        position: currentCount + createdPhotos.length,
      },
    });

    createdPhotos.push(photo);
  }

  return NextResponse.json({ photos: createdPhotos }, { status: 201 });
}
