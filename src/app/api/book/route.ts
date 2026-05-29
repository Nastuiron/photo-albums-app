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
