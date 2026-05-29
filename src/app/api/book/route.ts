import { getCurrentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function GET() {
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
    include: {
      photos: {
        orderBy: { position: 'asc' },
      },
    },
  });

  return NextResponse.json({ book });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const title = typeof body.title === 'string' ? body.title.trim() : '';

  if (title.length < 2) {
    return NextResponse.json(
      { error: 'Title must contain at least 2 characters' },
      { status: 400 },
    );
  }

  if (title.length > 100) {
    return NextResponse.json(
      { error: 'Title must contain at most 100 characters' },
      { status: 400 },
    );
  }

  const book = await prisma.book.update({
    where: { userId: user.id },
    data: { title },
  });

  return NextResponse.json({ book });
}
