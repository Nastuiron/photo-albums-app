'use client';

import { useMemo, useState } from 'react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Check,
  Copy,
  GripHorizontal,
  ImagePlus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import { useBook } from '@/features/book/hooks/useBook';
import type { BookPhoto } from '@/features/book/types/book.types';

type PreviewFile = {
  file: File;
  previewUrl: string;
};

function bookPhotoUrl(photoId: string, variant: 'thumb' | 'image' = 'thumb') {
  return `/api/book/photos/${photoId}/file?variant=${variant}`;
}

function SortableBookPhotoCard({
  photo,
  index,
  isSelected,
  onOpen,
  onToggleSelect,
}: {
  photo: BookPhoto;
  index: number;
  isSelected: boolean;
  onOpen: (photo: BookPhoto) => void;
  onToggleSelect: (photoId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    animation: `fadeIn 0.4s ease ${index * 40}ms both`,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`group relative overflow-hidden rounded-2xl border bg-zinc-900 transition ${
        isSelected
          ? 'border-emerald-400/70 ring-2 ring-emerald-400/20'
          : 'border-white/10 hover:border-white/25'
      }`}
    >
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bookPhotoUrl(photo.id, 'thumb')}
          alt={photo.originalName}
          draggable={false}
          onClick={() => onOpen(photo)}
          className={`aspect-[4/3] w-full cursor-zoom-in select-none object-cover transition duration-500 group-hover:scale-105 ${
            isSelected ? 'brightness-75' : 'group-hover:brightness-75'
          }`}
        />

        <button
          type="button"
          aria-label={
            isSelected ? 'Retirer de la sélection' : 'Sélectionner la photo'
          }
          onClick={() => onToggleSelect(photo.id)}
          className={`absolute left-3 top-3 flex size-9 items-center justify-center rounded-full border text-white shadow-lg transition ${
            isSelected
              ? 'border-emerald-300 bg-emerald-500 text-zinc-950 opacity-100'
              : 'border-white/30 bg-black/50 opacity-0 hover:bg-black/70 group-hover:opacity-100'
          }`}
        >
          {isSelected && <Check size={18} strokeWidth={3} />}
        </button>

        <button
          type="button"
          aria-label="Déplacer la photo"
          className="absolute right-3 top-3 flex size-9 cursor-grab items-center justify-center rounded-full border border-white/20 bg-black/55 text-white opacity-0 shadow-lg transition hover:bg-black/75 group-hover:opacity-100 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripHorizontal size={18} />
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 p-3">
        <p className="min-w-0 truncate text-xs text-zinc-300">
          {photo.originalName}
        </p>
      </div>
    </article>
  );
}

function BookSelectionDrawer({
  selectedPhotos,
  onClearSelection,
  onDelete,
}: {
  selectedPhotos: BookPhoto[];
  onClearSelection: () => void;
  onDelete: () => void;
}) {
  if (selectedPhotos.length === 0) return null;

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-30 rounded-2xl border border-white/10 bg-zinc-900/95 p-4 text-white shadow-2xl shadow-black/40 backdrop-blur md:bottom-6 md:left-auto md:right-6 md:top-24 md:w-80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">
            {selectedPhotos.length} sélectionnée
            {selectedPhotos.length > 1 ? 's' : ''}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Action appliquée au book.
          </p>
        </div>

        <button
          type="button"
          aria-label="Fermer la sélection"
          onClick={onClearSelection}
          className="flex size-9 items-center justify-center rounded-full border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
        >
          <X size={17} />
        </button>
      </div>

      <div className="mt-4 max-h-40 space-y-2 overflow-auto pr-1 md:max-h-72">
        {selectedPhotos.map((photo) => (
          <div
            key={photo.id}
            className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-2"
          >
            <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bookPhotoUrl(photo.id)}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>

            <p className="min-w-0 truncate text-xs text-zinc-300">
              {photo.originalName}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/25 px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-500/10"
      >
        <Trash2 size={17} />
        Supprimer la sélection
      </button>
    </aside>
  );
}

function BookTitleForm({
  initialTitle,
  savingTitle,
  updateTitle,
}: {
  initialTitle: string;
  savingTitle: boolean;
  updateTitle: (title: string) => Promise<void>;
}) {
  const [bookTitle, setBookTitle] = useState(initialTitle);

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950 p-3">
      <label className="text-sm font-medium" htmlFor="bookTitle">
        Nom public du book
      </label>
      <input
        id="bookTitle"
        value={bookTitle}
        onChange={(e) => setBookTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            updateTitle(bookTitle);
          }
        }}
        className="mt-3 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
        placeholder="Mon book"
      />

      <button
        type="button"
        onClick={() => updateTitle(bookTitle)}
        disabled={savingTitle}
        className="mt-3 w-full rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
      >
        {savingTitle ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  );
}

export default function BookPanel({ appUrl }: { appUrl: string }) {
  const {
    book,
    photos,
    loading,
    uploading,
    savingTitle,
    regeneratingShareToken,
    uploadPhotos,
    deletePhotos,
    reorderPhotos,
    updateTitle,
    regenerateShareToken,
    copyShareLink,
  } = useBook();
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<BookPhoto | null>(null);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const shareUrl = book?.shareToken ? `${appUrl}/b/${book.shareToken}` : '';
  const selectedPhotos = useMemo(
    () => photos.filter((photo) => selectedPhotoIds.includes(photo.id)),
    [photos, selectedPhotoIds],
  );

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

  function togglePhotoSelection(photoId: string) {
    setSelectedPhotoIds((current) =>
      current.includes(photoId)
        ? current.filter((id) => id !== photoId)
        : [...current, photoId],
    );
  }

  function clearSelection() {
    setSelectedPhotoIds([]);
  }

  async function handleDeleteSelection() {
    await deletePhotos(selectedPhotos.map((photo) => photo.id));
    clearSelection();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex((photo) => photo.id === active.id);
    const newIndex = photos.findIndex((photo) => photo.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    await reorderPhotos(arrayMove(photos, oldIndex, newIndex));
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

        {book && (
          <BookTitleForm
            key={book.id}
            initialTitle={book.title}
            savingTitle={savingTitle}
            updateTitle={updateTitle}
          />
        )}

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
            <h2 className="text-2xl font-bold tracking-tight">
              {book?.title ?? 'Mon book'}
            </h2>
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
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={photos.map((photo) => photo.id)}
              strategy={rectSortingStrategy}
            >
              <div
                className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4"
                onContextMenu={(e) => e.preventDefault()}
              >
                {photos.map((photo, index) => (
                  <SortableBookPhotoCard
                    key={photo.id}
                    photo={photo}
                    index={index}
                    isSelected={selectedPhotoIds.includes(photo.id)}
                    onOpen={setSelectedPhoto}
                    onToggleSelect={togglePhotoSelection}
                  />
                ))}
              </div>

              <BookSelectionDrawer
                selectedPhotos={selectedPhotos}
                onClearSelection={clearSelection}
                onDelete={handleDeleteSelection}
              />
            </SortableContext>
          </DndContext>
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
