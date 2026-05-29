import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import {
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { r2 } from '@/lib/r2';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

async function saveAlbumPhotoLocal(params: { albumId: string; file: File }) {
  const { albumId, file } = params;

  const bytes = await file.arrayBuffer();
  const inputBuffer = Buffer.from(bytes);

  const id = crypto.randomUUID();

  const originalFilename = `${id}-original.webp`;
  const largeFilename = `${id}-large.webp`;
  const thumbnailFilename = `${id}-thumbnail.webp`;

  const albumDir = path.join(UPLOAD_DIR, 'albums', albumId);

  const originalDir = path.join(albumDir, 'original');
  const largeDir = path.join(albumDir, 'large');
  const thumbnailDir = path.join(albumDir, 'thumbnail');

  await fs.mkdir(originalDir, { recursive: true });
  await fs.mkdir(largeDir, { recursive: true });
  await fs.mkdir(thumbnailDir, { recursive: true });

  let metadata: sharp.Metadata;

  try {
    metadata = await sharp(inputBuffer).metadata();
  } catch {
    throw new Error('Fichier image invalide');
  }

  if (!metadata.width || !metadata.height) {
    throw new Error('Fichier image invalide');
  }

  const originalBuffer = await sharp(inputBuffer)
    .rotate()
    .webp({ quality: 92 })
    .toBuffer();

  const largeBuffer = await sharp(inputBuffer)
    .rotate()
    .resize({
      width: 1920,
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();

  const thumbnailBuffer = await sharp(inputBuffer)
    .rotate()
    .resize({
      width: 480,
      height: 360,
      fit: 'cover',
    })
    .webp({ quality: 75 })
    .toBuffer();

  await fs.writeFile(path.join(originalDir, originalFilename), originalBuffer);
  await fs.writeFile(path.join(largeDir, largeFilename), largeBuffer);
  await fs.writeFile(
    path.join(thumbnailDir, thumbnailFilename),
    thumbnailBuffer,
  );

  return {
    filename: originalFilename,
    size: originalBuffer.length,
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    storageKeyOriginal: `albums/${albumId}/original/${originalFilename}`,
    storageKeyLarge: `albums/${albumId}/large/${largeFilename}`,
    storageKeyThumbnail: `albums/${albumId}/thumbnail/${thumbnailFilename}`,
  };
}

async function saveAlbumPhotoR2(params: { albumId: string; file: File }) {
  const { albumId, file } = params;

  const bytes = await file.arrayBuffer();
  const inputBuffer = Buffer.from(bytes);

  let metadata: sharp.Metadata;

  try {
    metadata = await sharp(inputBuffer).metadata();
  } catch {
    throw new Error('Fichier image invalide');
  }

  if (!metadata.width || !metadata.height) {
    throw new Error('Fichier image invalide');
  }

  const id = crypto.randomUUID();

  const originalKey = `albums/${albumId}/original/${id}-original.webp`;
  const largeKey = `albums/${albumId}/large/${id}-large.webp`;
  const thumbnailKey = `albums/${albumId}/thumbnail/${id}-thumbnail.webp`;

  const originalBuffer = await sharp(inputBuffer)
    .rotate()
    .webp({ quality: 92 })
    .toBuffer();

  const largeBuffer = await sharp(inputBuffer)
    .rotate()
    .resize({
      width: 1920,
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();

  const thumbnailBuffer = await sharp(inputBuffer)
    .rotate()
    .resize({
      width: 480,
      height: 360,
      fit: 'cover',
    })
    .webp({ quality: 75 })
    .toBuffer();

  await Promise.all([
    r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: originalKey,
        Body: originalBuffer,
        ContentType: 'image/webp',
      }),
    ),
    r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: largeKey,
        Body: largeBuffer,
        ContentType: 'image/webp',
      }),
    ),
    r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: 'image/webp',
      }),
    ),
  ]);

  return {
    filename: `${id}-original.webp`,
    size: originalBuffer.length,
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    storageKeyOriginal: originalKey,
    storageKeyLarge: largeKey,
    storageKeyThumbnail: thumbnailKey,
  };
}

async function deleteAlbumPhotoLocal(storageKeys: {
  original?: string | null;
  large?: string | null;
  thumbnail?: string | null;
}) {
  const keys = [
    storageKeys.original,
    storageKeys.large,
    storageKeys.thumbnail,
  ].filter(Boolean) as string[];

  for (const storageKey of keys) {
    const filePath = path.join(UPLOAD_DIR, storageKey);

    try {
      await fs.unlink(filePath);
    } catch {
      // fichier déjà absent : non bloquant
    }
  }
}

export async function saveAlbumPhoto(params: { albumId: string; file: File }) {
  const driver = process.env.STORAGE_DRIVER ?? 'local';

  if (driver === 'local') {
    return saveAlbumPhotoLocal(params);
  }

  if (driver === 'r2') {
    return saveAlbumPhotoR2(params);
  }

  throw new Error('Invalid STORAGE_DRIVER');
}

async function saveBookPhotoLocal(params: { bookId: string; file: File }) {
  const { bookId, file } = params;

  const bytes = await file.arrayBuffer();
  const inputBuffer = Buffer.from(bytes);
  const id = crypto.randomUUID();

  const filename = `${id}.webp`;
  const thumbnailFilename = `${id}-thumbnail.webp`;
  const bookDir = path.join(UPLOAD_DIR, 'books', bookId);
  const originalDir = path.join(bookDir, 'original');
  const thumbnailDir = path.join(bookDir, 'thumbnail');

  await fs.mkdir(originalDir, { recursive: true });
  await fs.mkdir(thumbnailDir, { recursive: true });

  let metadata: sharp.Metadata;

  try {
    metadata = await sharp(inputBuffer).metadata();
  } catch {
    throw new Error('Fichier image invalide');
  }

  if (!metadata.width || !metadata.height) {
    throw new Error('Fichier image invalide');
  }

  const imageBuffer = await sharp(inputBuffer)
    .rotate()
    .webp({ quality: 90 })
    .toBuffer();

  const thumbnailBuffer = await sharp(inputBuffer)
    .rotate()
    .resize({
      width: 720,
      withoutEnlargement: true,
    })
    .webp({ quality: 78 })
    .toBuffer();

  await fs.writeFile(path.join(originalDir, filename), imageBuffer);
  await fs.writeFile(
    path.join(thumbnailDir, thumbnailFilename),
    thumbnailBuffer,
  );

  return {
    filename,
    size: imageBuffer.length,
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    storageKeyOriginal: `books/${bookId}/original/${filename}`,
    storageKeyThumbnail: `books/${bookId}/thumbnail/${thumbnailFilename}`,
  };
}

async function saveBookPhotoR2(params: { bookId: string; file: File }) {
  const { bookId, file } = params;

  const bytes = await file.arrayBuffer();
  const inputBuffer = Buffer.from(bytes);
  const id = crypto.randomUUID();

  const originalKey = `books/${bookId}/original/${id}.webp`;
  const thumbnailKey = `books/${bookId}/thumbnail/${id}-thumbnail.webp`;

  let metadata: sharp.Metadata;

  try {
    metadata = await sharp(inputBuffer).metadata();
  } catch {
    throw new Error('Fichier image invalide');
  }

  if (!metadata.width || !metadata.height) {
    throw new Error('Fichier image invalide');
  }

  const imageBuffer = await sharp(inputBuffer)
    .rotate()
    .webp({ quality: 90 })
    .toBuffer();

  const thumbnailBuffer = await sharp(inputBuffer)
    .rotate()
    .resize({
      width: 720,
      withoutEnlargement: true,
    })
    .webp({ quality: 78 })
    .toBuffer();

  await Promise.all([
    r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: originalKey,
        Body: imageBuffer,
        ContentType: 'image/webp',
      }),
    ),
    r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: 'image/webp',
      }),
    ),
  ]);

  return {
    filename: `${id}.webp`,
    size: imageBuffer.length,
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    storageKeyOriginal: originalKey,
    storageKeyThumbnail: thumbnailKey,
  };
}

export async function saveBookPhoto(params: { bookId: string; file: File }) {
  const driver = process.env.STORAGE_DRIVER ?? 'local';

  if (driver === 'local') {
    return saveBookPhotoLocal(params);
  }

  if (driver === 'r2') {
    return saveBookPhotoR2(params);
  }

  throw new Error('Invalid STORAGE_DRIVER');
}

async function deleteAlbumPhotoR2(storageKeys: {
  original?: string | null;
  large?: string | null;
  thumbnail?: string | null;
}) {
  const keys = [
    storageKeys.original,
    storageKeys.large,
    storageKeys.thumbnail,
  ].filter(Boolean) as string[];

  await Promise.all(
    keys.map((key) =>
      r2.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
        }),
      ),
    ),
  );
}

export async function deleteAlbumPhoto(storageKeys: {
  original?: string | null;
  large?: string | null;
  thumbnail?: string | null;
}) {
  const driver = process.env.STORAGE_DRIVER ?? 'local';

  if (driver === 'local') {
    return deleteAlbumPhotoLocal(storageKeys);
  }

  if (driver === 'r2') {
    return deleteAlbumPhotoR2(storageKeys);
  }

  throw new Error('Invalid STORAGE_DRIVER');
}

export async function deleteBookPhoto(storageKeys: {
  original?: string | null;
  thumbnail?: string | null;
}) {
  return deleteAlbumPhoto({
    original: storageKeys.original,
    thumbnail: storageKeys.thumbnail,
  });
}

export async function deleteAlbumDirectory(albumId: string) {
  const driver = process.env.STORAGE_DRIVER ?? 'local';

  if (driver === 'r2') {
    const prefix = `albums/${albumId}/`;

    const listed = await r2.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME!,
        Prefix: prefix,
      }),
    );

    const objects = listed.Contents?.map((item) => ({
      Key: item.Key!,
    }));

    if (!objects || objects.length === 0) {
      return;
    }

    await r2.send(
      new DeleteObjectsCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Delete: {
          Objects: objects,
        },
      }),
    );

    return;
  }

  const albumDir = path.join(process.cwd(), 'uploads', 'albums', albumId);

  try {
    await fs.rm(albumDir, {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 100,
    });
  } catch (error) {
    console.error('Failed to delete album directory:', error);
  }
}

export async function getStoredFile(storageKey: string) {
  const driver = process.env.STORAGE_DRIVER ?? 'local';

  if (driver === 'r2') {
    const result = await r2.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: storageKey,
      }),
    );

    if (!result.Body) {
      throw new Error('File not found');
    }

    const arrayBuffer = await result.Body.transformToByteArray();

    return {
      buffer: Buffer.from(arrayBuffer),
      contentType: result.ContentType ?? 'application/octet-stream',
    };
  }

  const filePath = path.join(process.cwd(), 'uploads', storageKey);
  const buffer = await fs.readFile(filePath);

  return {
    buffer,
    contentType: getContentType(storageKey),
  };
}

function getContentType(filePath: string) {
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}
