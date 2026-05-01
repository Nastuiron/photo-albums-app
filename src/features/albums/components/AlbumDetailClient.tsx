'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { AlbumDetail } from '@/features/albums/types/album.types';
import { useAlbumPhotos } from '@/features/albums/hooks/useAlbumPhotos';
import { useAlbumShare } from '@/features/albums/hooks/useAlbumShare';
import { useAlbumSettings } from '@/features/albums/hooks/useAlbumSettings';

type PreviewFile = {
  file: File;
  previewUrl: string;
};

const SortablePhotos = dynamic(
  () => import('@/features/albums/components/SortablePhotos'),
  {
    ssr: false,
  },
);

export default function AlbumDetailClient({
  album,
  appUrl,
}: {
  album: AlbumDetail;
  appUrl: string;
}) {
  const router = useRouter();
  const {
    photos,
    setPhotos,
    uploading,
    uploadPhotos: uploadPhotosFromHook,
    deletePhoto,
  } = useAlbumPhotos(album.id, album.photos);
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const {
    isShared,
    shareToken,
    toggleShare,
    regenerateShareToken,
    copyShareLink,
  } = useAlbumShare(album.id, album.isShared, album.shareToken);
  const { title, setTitle, savingTitle, updateAlbumTitle, setCoverPhoto } =
    useAlbumSettings(album.id, album.title, router.refresh);

  async function handleUploadPhotos(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const selectedFiles = files.map(({ file }) => file);

    await uploadPhotosFromHook(selectedFiles);

    files.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    setFiles([]);
  }

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

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <button
              onClick={() => router.push('/dashboard')}
              className="mb-3 text-sm text-zinc-400 hover:text-white"
            >
              ← Retour au dashboard
            </button>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateAlbumTitle();
                  }
                }}
                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-2xl font-bold text-white outline-none focus:border-white/30"
              />

              <button
                onClick={updateAlbumTitle}
                disabled={savingTitle}
                className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
              >
                {savingTitle ? 'Sauvegarde...' : 'Renommer'}
              </button>
            </div>

            {album.description && (
              <p className="mt-1 text-sm text-zinc-400">{album.description}</p>
            )}
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs ${
              isShared
                ? 'bg-emerald-500/10 text-emerald-300'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {isShared ? 'Partagé' : 'Privé'}
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-10">
        <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Partage public</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {isShared
                  ? 'Cet album est accessible via le lien public.'
                  : 'Active le partage pour générer un lien public.'}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={toggleShare}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  isShared
                    ? 'bg-red-500/10 text-red-300 hover:bg-red-500/20'
                    : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                }`}
              >
                {isShared ? 'Désactiver' : 'Activer'}
              </button>

              <button
                onClick={regenerateShareToken}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
              >
                Régénérer
              </button>
            </div>
          </div>

          {isShared && (
            <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-zinc-950 p-3 sm:flex-row">
              <input
                readOnly
                value={`${appUrl}/a/${shareToken}`}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-zinc-300"
              />

              <button
                onClick={() => copyShareLink(appUrl)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
              >
                Copier
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <form onSubmit={handleUploadPhotos} className="mb-8 space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
            className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-zinc-900 p-10 text-center hover:border-white/40"
          >
            <h2 className="text-lg font-semibold">Ajouter des photos</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Glisse tes images ici ou sélectionne-les manuellement.
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Formats acceptés : JPG, PNG, WEBP.
            </p>

            <input
              id="fileInput"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <label
              htmlFor="fileInput"
              className="mt-5 rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
            >
              Sélectionner des fichiers
            </label>
          </div>

          {files.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((file, index) => (
                <div
                  key={`${file.file.name}-${index}`}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.previewUrl}
                    alt={file.file.name}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="flex items-center justify-between gap-3 p-3">
                    <p className="truncate text-xs text-zinc-300">
                      {file.file.name}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {files.length > 0 && (
            <button
              type="submit"
              disabled={uploading}
              className="w-full rounded-xl bg-white px-4 py-3 font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
            >
              {uploading ? 'Upload...' : `Uploader ${files.length} fichier(s)`}
            </button>
          )}
        </form>

        {photos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-900 p-10 text-center">
            <h3 className="text-lg font-semibold">Aucune photo</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Ajoute tes premières photos à cet album.
            </p>
          </div>
        ) : (
          <SortablePhotos
            albumId={album.id}
            photos={photos}
            setPhotos={setPhotos}
            setCoverPhoto={setCoverPhoto}
            deletePhoto={deletePhoto}
          />
        )}
      </section>
    </main>
  );
}
