import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type Params = {
  params: Promise<{
    shareToken: string;
  }>;
};

function sanitizeFilename(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_ .]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 80);
}

export async function GET(_req: Request, { params }: Params) {
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
      },
    },
  });

  if (!album) {
    return NextResponse.json({ error: 'Album not found' }, { status: 404 });
  }

  if (album.photos.length === 0) {
    return NextResponse.json({ error: 'Album has no photos' }, { status: 400 });
  }

  const zip = new JSZip();
  const folderName = sanitizeFilename(album.title || 'album');
  const folder = zip.folder(folderName);

  if (!folder) {
    return NextResponse.json(
      { error: 'Unable to create ZIP folder' },
      { status: 500 },
    );
  }

  for (const photo of album.photos) {
    const filePath = path.join(
      process.cwd(),
      'uploads',
      photo.storageKeyOriginal,
    );

    try {
      const fileBuffer = await fs.readFile(filePath);

      const extension =
        photo.originalName.split('.').pop()?.toLowerCase() || 'jpg';

      const fileName = `${String(photo.position + 1).padStart(3, '0')}-${sanitizeFilename(
        photo.originalName,
      )}.${extension}`;

      folder.file(fileName, fileBuffer);
    } catch {
      // Si un fichier manque sur le disque, on ignore pour ne pas bloquer tout le ZIP.
    }
  }

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6,
    },
  });

  const zipFileName = `${folderName}.zip`;

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${zipFileName}"`,
    },
  });
}
