'use client';

import { useState } from 'react';
import { Copy, ImagePlus, RefreshCw, Trash2, X } from 'lucide-react';
import { useBook } from '@/features/book/hooks/useBook';
import type { BookPhoto } from '@/features/book/types/book.types';

type PreviewFile = {
  file: File;
  previewUrl: string;
};

function bookPhotoUrl(photoId: string, variant: 'thumb' | 'image' = 'thumb') {
  return `/api/book/photos/${photoId}/file?variant=${variant}`;
}

export default function BookPanel({ appUrl }: { appUrl: string }) {
  const {
    book,
    photos,
    loading,
    uploading,
    regeneratingShareToken,
    uploadPhotos,
    deletePhoto,
    regenerateShareToken,
    copyShareLink,
  } = useBook();
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<BookPhoto | null>(null);
  const shareUrl = book?.shareToken ? `${appUrl}/b/${book.shareToken}` : '';

  function handleFiles(selectedFiles: FileList | null) {
    if (!selectedFiles) return;

    const validFiles = Array.from(selectedFiles)
      .filter((file) =>
        ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      )
      .map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

    setFiles((current) => [...current, ...validFiles]);
  }

  function removeFile(index: number) {
    setFiles((current) => {
      const fileToRemove = current[index];

      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }

      return current.filter((_, i) => i !== index);
    });
  }

  async function handleUploadPhotos(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await uploadPhotos(files.map(({ file }) => file));

    files.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    setFiles([]);
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="h-fit space-y-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 lg:sticky lg:top-6">
        <div>
          <h2 className="text-base font-semibold">Ajouter au book</h2>
          <p className="mt-1 text-xs leading-5 text-zinc-400">
            Galerie publique, sans action de téléchargement.
          </p>
        </div>

        <form onSubmit={handleUploadPhotos} className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
            className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-zinc-950 p-4 text-center hover:border-white/40"
          >
            <ImagePlus className="text-zinc-500" size={24} />
            <p className="mt-2 text-sm text-zinc-300">Glisse des images ici.</p>
            <p className="mt-1 text-xs text-zinc-500">JPG, PNG, WEBP.</p>

            <input
              id="bookFileInput"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <label
              htmlFor="bookFileInput"
              className="mt-3 rounded-xl bg-white px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
            >
              Sélectionner
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.file.name}-${index}`}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-800"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.previewUrl}
                      alt={file.file.name}
                      className="h-full w-full object-cover"
                    />

                    <button
                      type="button"
                      aria-label="Retirer"
                      onClick={() => removeFile(index)}
                      className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
              >
                {uploading ? 'Upload...' : `Ajouter ${files.length} photo(s)`}
              </button>
            </div>
          )}
        </form>

        <div className="rounded-xl border border-white/10 bg-zinc-950 p-3">
          <p className="text-sm font-medium">Lien public</p>
          <input
            readOnly
            value={shareUrl}
            className="mt-3 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-300"
          />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => copyShareLink(appUrl)}
              disabled={!shareUrl}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/10 disabled:opacity-40"
            >
              <Copy size={14} />
              Copier
            </button>

            <button
              type="button"
              onClick={regenerateShareToken}
              disabled={regeneratingShareToken}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/10 disabled:opacity-40"
            >
              <RefreshCw size={14} />
              Régénérer
            </button>
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Mon book</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Galerie publique permanente.
            </p>
          </div>

          <span className="text-sm text-zinc-500">
            {photos.length} photo{photos.length > 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-8 text-zinc-400">
            Chargement du book...
          </div>
        ) : photos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-900 p-10 text-center">
            <h3 className="text-lg font-semibold">Book vide</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Ajoute tes premières images pour construire ta galerie.
            </p>
          </div>
        ) : (
          <div
            className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4"
            onContextMenu={(e) => e.preventDefault()}
          >
            {photos.map((photo, index) => (
              <article
                key={photo.id}
                style={{
                  animation: `fadeIn 0.4s ease ${index * 40}ms both`,
                }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bookPhotoUrl(photo.id, 'thumb')}
                  alt={photo.originalName}
                  draggable={false}
                  onClick={() => setSelectedPhoto(photo)}
                  className="aspect-[4/3] w-full cursor-zoom-in select-none object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="flex items-center justify-between gap-2 p-3">
                  <p className="min-w-0 truncate text-xs text-zinc-300">
                    {photo.originalName}
                  </p>

                  <button
                    type="button"
                    aria-label="Supprimer du book"
                    onClick={() => deletePhoto(photo.id)}
                    className="flex size-8 shrink-0 items-center justify-center rounded-full border border-red-500/20 text-red-300 opacity-0 transition hover:bg-red-500/10 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6"
          onClick={() => setSelectedPhoto(null)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setSelectedPhoto(null)}
            className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white hover:bg-white/10"
          >
            <X size={18} />
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bookPhotoUrl(selectedPhoto.id, 'image')}
            alt={selectedPhoto.originalName}
            draggable={false}
            className="max-h-full max-w-full select-none rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
