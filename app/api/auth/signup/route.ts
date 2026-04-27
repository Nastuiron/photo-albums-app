import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  name: z.string().min(2).max(100),
});

export async function POST(req: Request) {
  const body = await req.json();
  const result = SignupSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? 'Données invalides' },
      { status: 400 },
    );
  }

  const { email, password, name } = result.data;

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hashedPassword,
    },
  });

  return NextResponse.json({ userId: user.id });
}
