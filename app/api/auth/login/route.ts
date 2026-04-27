import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

const loginSchema = z.object({
  email: z.string().email('Email invalide').toLowerCase(),
  password: z.string().min(1, 'Mot de passe requis'),
});

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  const limited = rateLimit({
    key: `login:${ip}`,
    limit: 5,
    windowMs: 60 * 1000,
  });

  if (!limited.success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessaie dans une minute.' },
      { status: 429 },
    );
  }
  const body = await req.json();
  const result = loginSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? 'Données invalides' },
      { status: 400 },
    );
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signToken({ userId: user.id });

  const response = NextResponse.json({ success: true });

  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
