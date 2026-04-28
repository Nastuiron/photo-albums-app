import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export const runtime = 'nodejs';

type Params = {
  params: Promise<{
    shareToken: string;
  }>;
};

const STORAGE_DRIVER = process.env.STORAGE_DRIVER || 'local';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

function sanitizeFilename(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_ .]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 80);
}

async function getLocalPhotoBuffer(storageKey: string) {
  const filePath = path.join(process.cwd(), 'uploads', storageKey);

  console.log('LOCAL FILE PATH:', filePath);

  return fs.readFile(filePath);
}

async function getR2PhotoBuffer(storageKey: string) {
  const result = await r2Client.send(
    new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: storageKey,
    }),
  );

  if (!result.Body) {
    throw new Error(`Fichier R2 introuvable: ${storageKey}`);
  }

  const chunks: Uint8Array[] = [];

  for await (const chunk of result.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

async function getPhotoBuffer(storageKey: string) {
  if (STORAGE_DRIVER === 'r2') {
    return getR2PhotoBuffer(storageKey);
  }

  return getLocalPhotoBuffer(storageKey);
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

  let addedFiles = 0;

  for (const photo of album.photos) {
    try {
      console.log('PHOTO:', photo.originalName);
      console.log('STORAGE DRIVER:', STORAGE_DRIVER);
      console.log('STORAGE KEY:', photo.storageKeyOriginal);

      const fileBuffer = await getPhotoBuffer(photo.storageKeyOriginal);

      const extension =
        photo.originalName.split('.').pop()?.toLowerCase() || 'jpg';

      const cleanName = sanitizeFilename(
        photo.originalName.replace(/\.[^/.]+$/, ''),
      );

      const fileName = `${String(photo.position + 1).padStart(
        3,
        '0',
      )}-${cleanName}.${extension}`;

      folder.file(fileName, fileBuffer);
      addedFiles++;
    } catch (error) {
      console.error('Impossible d’ajouter la photo au ZIP:', {
        storageDriver: STORAGE_DRIVER,
        storageKey: photo.storageKeyOriginal,
        originalName: photo.originalName,
        error,
      });
    }
  }

  if (addedFiles === 0) {
    return NextResponse.json(
      { error: 'Aucune photo trouvée pour générer le ZIP' },
      { status: 500 },
    );
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
