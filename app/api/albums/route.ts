import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/current-user';
import { createSlug } from '@/lib/slug';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const albums = await prisma.album.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { photos: true },
      },
      photos: {
        take: 1,
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return NextResponse.json({ albums });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, description } = body;

  if (!title || title.trim().length < 2) {
    return NextResponse.json(
      { error: 'Title must contain at least 2 characters' },
      { status: 400 },
    );
  }

  const baseSlug = createSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (
    await prisma.album.findUnique({
      where: {
        userId_slug: {
          userId: user.id,
          slug,
        },
      },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const album = await prisma.album.create({
    data: {
      userId: user.id,
      title,
      slug,
      description,
      shareToken: crypto.randomBytes(32).toString('hex'),
    },
  });

  return NextResponse.json({ album }, { status: 201 });
}
