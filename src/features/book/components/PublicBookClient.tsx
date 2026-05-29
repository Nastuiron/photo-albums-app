'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type PublicBookPhoto = {
  id: string;
  originalName: string;
};

type PublicBook = {
  title: string;
  ownerName: string | null;
  shareToken: string;
  photos: PublicBookPhoto[];
};

function photoUrl(
  photo: PublicBookPhoto,
  token: string,
  variant: 'thumb' | 'image' = 'thumb',
) {
  return `/api/public/book/photos/${photo.id}?token=${token}&variant=${variant}`;
}

export default function PublicBookClient({ book }: { book: PublicBook }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedPhoto =
    selectedIndex !== null ? book.photos[selectedIndex] : null;
  const hasPrevious = selectedIndex !== null && selectedIndex > 0;
  const hasNext =
    selectedIndex !== null && selectedIndex < book.photos.length - 1;

  const closeViewer = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const showPrevious = useCallback(() => {
    setSelectedIndex((current) =>
      current !== null && current > 0 ? current - 1 : current,
    );
  }, []);

  const showNext = useCallback(() => {
    setSelectedIndex((current) =>
      current !== null && current < book.photos.length - 1
        ? current + 1
        : current,
    );
  }, [book.photos.length]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (selectedIndex === null) return;

      if (event.key === 'Escape') closeViewer();
      if (event.key === 'ArrowLeft') showPrevious();
      if (event.key === 'ArrowRight') showNext();
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeViewer, selectedIndex, showNext, showPrevious]);

  return (
    <main
      className="min-h-screen overflow-x-hidden bg-zinc-950 text-white"
      onContextMenu={(e) => e.preventDefault()}
    >
      <section className="mx-auto max-w-6xl px-5 py-10">
        <header className="mb-8">
          <p className="text-sm text-zinc-500">Book public</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {book.ownerName ? `Book de ${book.ownerName}` : book.title}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {book.photos.length} photo{book.photos.length > 1 ? 's' : ''}
          </p>
        </header>

        {book.photos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-900 p-8 text-center">
            <h2 className="text-lg font-semibold">Book vide</h2>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {book.photos.map((photo, index) => (
              <article
                key={photo.id}
                style={{
                  animation: `fadeIn 0.35s ease ${index * 30}ms both`,
                }}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl(photo, book.shareToken)}
                  alt={photo.originalName}
                  draggable={false}
                  onClick={() => setSelectedIndex(index)}
                  className="aspect-[4/3] w-full cursor-zoom-in select-none object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-5"
          onClick={closeViewer}
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={closeViewer}
            className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white hover:bg-white/10"
          >
            <X size={18} />
          </button>

          <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/60 px-3 py-2 text-sm text-zinc-200">
            {(selectedIndex ?? 0) + 1} / {book.photos.length}
          </div>

          {hasPrevious && (
            <button
              type="button"
              aria-label="Photo précédente"
              onClick={(e) => {
                e.stopPropagation();
                showPrevious();
              }}
              className="absolute left-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white hover:bg-white/10"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {hasNext && (
            <button
              type="button"
              aria-label="Photo suivante"
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              className="absolute right-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white hover:bg-white/10"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl(selectedPhoto, book.shareToken, 'image')}
            alt={selectedPhoto.originalName}
            draggable={false}
            className="max-h-full max-w-full select-none rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
