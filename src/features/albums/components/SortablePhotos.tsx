'use client';

import Image from 'next/image';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Photo } from '@/features/albums/types/album.types';
import { reorderPhotos } from '../services/photo.api';

type SortablePhotosProps = {
  albumId: string;
  photos: Photo[];
  setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
  setCoverPhoto: (photoId: string) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
};

type SortablePhotoCardProps = {
  photo: Photo;
  setCoverPhoto: (photoId: string) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
};

function SortablePhotoCard({
  photo,
  setCoverPhoto,
  deletePhoto,
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
      className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
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
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />

          <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
            Déplacer
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <p className="truncate text-sm text-zinc-300">{photo.originalName}</p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setCoverPhoto(photo.id)}
            className="rounded-xl border border-emerald-500/20 px-3 py-2 text-sm text-emerald-300 hover:bg-emerald-500/10"
          >
            Couverture
          </button>

          <button
            type="button"
            onClick={() => deletePhoto(photo.id)}
            className="rounded-xl border border-red-500/20 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
          >
            Supprimer
          </button>
        </div>
      </div>
    </article>
  );
}

export default function SortablePhotos({
  albumId,
  photos,
  setPhotos,
  setCoverPhoto,
  deletePhoto,
}: SortablePhotosProps) {
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
              setCoverPhoto={setCoverPhoto}
              deletePhoto={deletePhoto}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
