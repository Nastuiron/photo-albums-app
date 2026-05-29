import crypto from 'crypto';
import { getCurrentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const book = await prisma.book.update({
    where: { userId: user.id },
    data: {
      shareToken: crypto.randomBytes(32).toString('hex'),
    },
  });

  return NextResponse.json({ book });
}
