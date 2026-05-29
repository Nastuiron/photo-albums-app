import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PublicBookClient from '@/features/book/components/PublicBookClient';

type Props = {
  params: Promise<{
    shareToken: string;
  }>;
};

export default async function PublicBookPage({ params }: Props) {
  const { shareToken } = await params;

  const book = await prisma.book.findUnique({
    where: {
      shareToken,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      photos: {
        orderBy: {
          position: 'asc',
        },
        select: {
          id: true,
          originalName: true,
        },
      },
    },
  });

  if (!book) {
    notFound();
  }

  return (
    <PublicBookClient
      book={{
        title: book.title,
        ownerName: book.user.name,
        shareToken: book.shareToken,
        photos: book.photos,
      }}
    />
  );
}
