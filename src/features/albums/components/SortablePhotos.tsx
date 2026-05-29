'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, GripHorizontal, ImageIcon, Trash2, X } from 'lucide-react';
import type { Photo } from '@/features/albums/types/album.types';
import { reorderPhotos } from '../services/photo.api';

type SortablePhotosProps = {
  albumId: string;
  photos: Photo[];
  setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
  coverPhotoId: string | null;
  setCoverPhoto: (photoId: string) => Promise<void>;
  deletePhotos: (photoIds: string[]) => Promise<void>;
};

type SortablePhotoCardProps = {
  photo: Photo;
  isCover: boolean;
  isSelected: boolean;
  onToggleSelect: (photoId: string) => void;
};

function SortablePhotoCard({
  photo,
  isCover,
  isSelected,
  onToggleSelect,
}: SortablePhotoCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`group overflow-hidden rounded-3xl border bg-zinc-900 transition ${
        isSelected
          ? 'border-emerald-400/70 ring-2 ring-emerald-400/20'
          : 'border-white/10 hover:border-white/25'
      }`}
    >
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={`/api/files/${
            photo.storageKeyThumbnail ??
            photo.storageKeyLarge ??
            photo.storageKeyOriginal
          }`}
          alt={photo.originalName}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition duration-200 ${
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

        {isCover && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-zinc-950 shadow-lg">
            <ImageIcon size={14} />
            Couverture
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="truncate text-sm text-zinc-300">{photo.originalName}</p>
      </div>
    </article>
  );
}

function SelectionDrawer({
  selectedPhotos,
  onClearSelection,
  onSetCover,
  onDelete,
}: {
  selectedPhotos: Photo[];
  onClearSelection: () => void;
  onSetCover: () => void;
  onDelete: () => void;
}) {
  if (selectedPhotos.length === 0) return null;

  const canSetCover = selectedPhotos.length === 1;

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-30 rounded-3xl border border-white/10 bg-zinc-900/95 p-4 text-white shadow-2xl shadow-black/40 backdrop-blur md:bottom-6 md:left-auto md:right-6 md:top-24 md:w-80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">
            {selectedPhotos.length} sélectionnée
            {selectedPhotos.length > 1 ? 's' : ''}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Choisis l’action à appliquer à la sélection.
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
            className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-2"
          >
            <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
              <Image
                src={`/api/files/${
                  photo.storageKeyThumbnail ??
                  photo.storageKeyLarge ??
                  photo.storageKeyOriginal
                }`}
                alt=""
                fill
                unoptimized
                sizes="48px"
                className="object-cover"
              />
            </div>

            <p className="min-w-0 truncate text-xs text-zinc-300">
              {photo.originalName}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2">
        <button
          type="button"
          onClick={onSetCover}
          disabled={!canSetCover}
          className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/25 px-4 py-3 text-sm font-medium text-emerald-300 hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ImageIcon size={17} />
          Définir comme couverture
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="flex items-center justify-center gap-2 rounded-xl border border-red-500/25 px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-500/10"
        >
          <Trash2 size={17} />
          Supprimer la sélection
        </button>
      </div>
    </aside>
  );
}

export default function SortablePhotos({
  albumId,
  photos,
  setPhotos,
  coverPhotoId,
  setCoverPhoto,
  deletePhotos,
}: SortablePhotosProps) {
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);

  const selectedPhotos = useMemo(
    () => photos.filter((photo) => selectedPhotoIds.includes(photo.id)),
    [photos, selectedPhotoIds],
  );

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

  async function handleSetCoverFromSelection() {
    if (selectedPhotos.length !== 1) return;

    await setCoverPhoto(selectedPhotos[0].id);
    clearSelection();
  }

  async function handleDeleteSelection() {
    const photoIds = selectedPhotos.map((photo) => photo.id);

    await deletePhotos(photoIds);
    clearSelection();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex((photo) => photo.id === active.id);
    const newIndex = photos.findIndex((photo) => photo.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newPhotos = arrayMove(photos, oldIndex, newIndex);

    setPhotos(newPhotos);

    try {
      await reorderPhotos(
        albumId,
        newPhotos.map((photo, index) => ({
          id: photo.id,
          position: index,
        })),
      );

      toast.success('Ordre des photos mis à jour');
    } catch (error) {
      console.error('REORDER PHOTOS ERROR:', error);
      toast.error('Erreur lors du changement d’ordre');
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={photos.map((photo) => photo.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <SortablePhotoCard
              key={photo.id}
              photo={photo}
              isCover={photo.id === coverPhotoId}
              isSelected={selectedPhotoIds.includes(photo.id)}
              onToggleSelect={togglePhotoSelection}
            />
          ))}
        </div>

        <SelectionDrawer
          selectedPhotos={selectedPhotos}
          onClearSelection={clearSelection}
          onSetCover={handleSetCoverFromSelection}
          onDelete={handleDeleteSelection}
        />
      </SortableContext>
    </DndContext>
  );
}
