'use client';

import { useEffect, useState } from 'react';
import { set } from 'zod';

type Photo = {
  id: string;
  originalName: string;
  storageKeyOriginal: string;
  storageKeyLarge: string | null;
  storageKeyThumbnail: string | null;
  mimeType: string;
};

type Album = {
  id: string;
  title: string;
  description: string | null;
  shareToken: string;
  photos: Photo[];
};

export default function PublicAlbumClient({ album }: { album: Album }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({
    pointerX: 0,
    pointerY: 0,
    imageX: 0,
    imageY: 0,
  });
  const [touchStart, setTouchStart] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const selectedPhoto =
    selectedIndex !== null ? album.photos[selectedIndex] : null;

  const [isTransitioning, setIsTransitioning] = useState(false);

  function photoUrl(
    photo: Photo,
    variant: 'large' | 'thumbnail' | 'original' = 'large',
  ) {
    return `/api/public/photos/${photo.id}?token=${album.shareToken}&variant=${variant}`;
  }

  function downloadUrl(photo: Photo) {
    return `/api/public/photos/${photo.id}?token=${album.shareToken}&download=1`;
  }

  function closeLightbox() {
    setSelectedIndex(null);
    setZoom(1);
  }

  function previousPhoto() {
    if (selectedIndex === null || isTransitioning) return;

    setIsTransitioning(true);

    setTimeout(() => {
      setZoom(1);
      setPosition({ x: 0, y: 0 });

      setSelectedIndex(
        selectedIndex === 0 ? album.photos.length - 1 : selectedIndex - 1,
      );

      setIsTransitioning(false);
    }, 150);
  }

  function nextPhoto() {
    if (selectedIndex === null || isTransitioning) return;

    setIsTransitioning(true);

    setTimeout(() => {
      setZoom(1);
      setPosition({ x: 0, y: 0 });

      setSelectedIndex(
        selectedIndex === album.photos.length - 1 ? 0 : selectedIndex + 1,
      );

      setIsTransitioning(false);
    }, 150);
  }

  function enterFullscreen() {
    const el = document.documentElement;

    if (el.requestFullscreen) {
      el.requestFullscreen();
    }
  }

  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (selectedIndex === null) return;

      if (event.key === 'Escape') {
        if (document.fullscreenElement) {
          exitFullscreen();
        } else {
          closeLightbox();
        }
      }

      if (event.key === 'ArrowLeft') previousPhoto();
      if (event.key === 'ArrowRight') nextPhoto();

      if (event.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIndex]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10">
          <p className="text-sm text-zinc-500">Album partagé</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            {album.title}
          </h1>

          {album.description && (
            <p className="mt-3 max-w-2xl text-zinc-400">{album.description}</p>
          )}

          <p className="mt-4 text-sm text-zinc-500">
            {album.photos.length} photo(s)
          </p>
          {album.photos.length > 0 && (
            <a
              href={`/api/public/albums/${album.shareToken}/download`}
              className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
            >
              Télécharger l’album complet
            </a>
          )}
        </header>

        {album.photos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-900 p-12 text-center">
            <h2 className="text-xl font-semibold">Aucune photo</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Cet album partagé ne contient pas encore de photo.
            </p>
          </div>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {album.photos.map((photo, index) => (
              <article
                key={photo.id}
                onClick={() => {
                  setSelectedIndex(index);
                }}
                style={{
                  animation: `fadeIn 0.4s ease ${index * 50}ms both`,
                }}
                className="group mb-4 block w-full cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 text-left transition-transform active:scale-[0.98]"
              >
                <img
                  src={photoUrl(photo, 'thumbnail')}
                  alt={photo.originalName}
                  className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />

                <div className="flex items-center justify-between gap-3 p-4">
                  <p className="truncate text-sm text-zinc-300">
                    {photo.originalName}
                  </p>

                  <span className="text-xs text-zinc-500">Voir</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedPhoto && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black text-white"
          onClick={closeLightbox}
        >
          <div
            className="flex items-center justify-between gap-4 border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <p className="text-sm text-zinc-400">
                {selectedIndex + 1} / {album.photos.length}
              </p>
              <p className="max-w-[60vw] truncate text-sm">
                {selectedPhoto.originalName}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setZoom((current) => Math.max(1, current - 0.25))
                }
                className="rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
              >
                -
              </button>

              <span className="min-w-14 text-center text-sm text-zinc-400">
                {Math.round(zoom * 100)}%
              </span>

              <button
                onClick={() =>
                  setZoom((current) => Math.min(3, current + 0.25))
                }
                className="rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
              >
                +
              </button>

              <button
                onClick={toggleFullscreen}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
              >
                Fullscreen
              </button>

              <a
                href={downloadUrl(selectedPhoto)}
                download
                className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
              >
                Télécharger
              </a>

              <button
                onClick={closeLightbox}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
              >
                Fermer
              </button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden">
            {album.photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  previousPhoto();
                }}
                className="absolute left-4 z-10 rounded-full border border-white/20 bg-black/60 px-4 py-3 text-2xl hover:bg-white/10"
              >
                ←
              </button>
            )}

            <div
              className={`flex h-full w-full items-center justify-center overflow-hidden p-8 ${
                zoom > 1
                  ? 'cursor-grab active:cursor-grabbing'
                  : 'cursor-default'
              }`}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => {
                if (zoom <= 1) return;

                e.currentTarget.setPointerCapture(e.pointerId);
                setIsDragging(true);
                setDragStart({
                  pointerX: e.clientX,
                  pointerY: e.clientY,
                  imageX: position.x,
                  imageY: position.y,
                });
              }}
              onPointerMove={(e) => {
                if (!isDragging || zoom <= 1) return;

                const deltaX = e.clientX - dragStart.pointerX;
                const deltaY = e.clientY - dragStart.pointerY;

                setPosition({
                  x: dragStart.imageX + deltaX,
                  y: dragStart.imageY + deltaY,
                });
              }}
              onPointerUp={(e) => {
                setIsDragging(false);

                if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                }
              }}
              onPointerCancel={() => {
                setIsDragging(false);
              }}
              onWheel={(e) => {
                if (!e.ctrlKey) return;

                e.preventDefault();

                setZoom((current) => {
                  const nextZoom =
                    e.deltaY < 0 ? current + 0.15 : current - 0.15;

                  if (nextZoom <= 1) {
                    setPosition({ x: 0, y: 0 });
                  }

                  return Math.min(3, Math.max(1, nextZoom));
                });
              }}
              onTouchStart={(e) => {
                const touch = e.touches[0];

                setTouchStart({
                  x: touch.clientX,
                  y: touch.clientY,
                });
              }}
              onTouchEnd={(e) => {
                if (!touchStart) return;

                const touch = e.changedTouches[0];

                const deltaX = touch.clientX - touchStart.x;
                const deltaY = touch.clientY - touchStart.y;

                // swipe horizontal uniquement
                if (
                  Math.abs(deltaX) > 50 &&
                  Math.abs(deltaX) > Math.abs(deltaY)
                ) {
                  if (deltaX > 0) {
                    previousPhoto();
                  } else {
                    nextPhoto();
                  }
                }

                setTouchStart(null);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl(selectedPhoto, 'large')}
                alt={selectedPhoto.originalName}
                className={`max-h-full max-w-full object-contain transition-all duration-300 ease-out ${
                  isTransitioning
                    ? 'opacity-0 scale-95'
                    : 'opacity-100 scale-100'
                }`}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                }}
                draggable={false}
              />
            </div>

            {album.photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextPhoto();
                }}
                className="absolute right-4 z-10 rounded-full border border-white/20 bg-black/60 px-4 py-3 text-2xl hover:bg-white/10"
              >
                →
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
