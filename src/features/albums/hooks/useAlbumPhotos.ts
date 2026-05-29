import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Photo } from '@/features/albums/types/album.types';
import {
  deletePhoto as deletePhotoApi,
  uploadPhotos as uploadPhotosApi,
} from '@/features/albums/services/photo.api';

export function useAlbumPhotos(albumId: string, initialPhotos: Photo[]) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);

  async function uploadPhotos(files: File[]) {
    if (files.length === 0) return;

    try {
      setUploading(true);

      const formData = new FormData();

      files.forEach((file) => {
        formData.append('photos', file);
      });

      const data = await uploadPhotosApi(albumId, formData);

      setPhotos((current) => [...current, ...data.photos]);
      toast.success('Photos uploadées avec succès');
    } catch (error) {
      console.error('UPLOAD ERROR:', error);
      toast.error("Erreur lors de l'upload des photos");
    } finally {
      setUploading(false);
    }
  }

  async function deletePhotos(photoIds: string[]) {
    if (photoIds.length === 0) return;

    const confirmed = confirm(
      photoIds.length === 1
        ? 'Supprimer cette photo ?'
        : `Supprimer ces ${photoIds.length} photos ?`,
    );

    if (!confirmed) return;

    try {
      await Promise.all(
        photoIds.map((photoId) => deletePhotoApi(albumId, photoId)),
      );

      setPhotos((current) =>
        current.filter((photo) => !photoIds.includes(photo.id)),
      );
      toast.success(
        photoIds.length === 1 ? 'Photo supprimée' : 'Photos supprimées',
      );
    } catch (error) {
      console.error('DELETE PHOTO ERROR:', error);
      toast.error('Erreur lors de la suppression');
    }
  }

  async function deletePhoto(photoId: string) {
    await deletePhotos([photoId]);
  }

  return {
    photos,
    setPhotos,
    uploading,
    uploadPhotos,
    deletePhoto,
    deletePhotos,
  };
}
