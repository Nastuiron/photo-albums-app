import { getStoredFile } from '@/lib/storage';
import { NextResponse } from 'next/server';

type Params = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(_req: Request, { params }: Params) {
  const { path } = await params;
  const storageKey = path.join('/');

  try {
    const file = await getStoredFile(storageKey);

    return new NextResponse(new Uint8Array(file.buffer), {
      headers: {
        'Content-Type': file.contentType,
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
