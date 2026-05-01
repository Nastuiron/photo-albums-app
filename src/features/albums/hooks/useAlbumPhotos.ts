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

  async function deletePhoto(photoId: string) {
    const confirmed = confirm('Supprimer cette photo ?');
    if (!confirmed) return;

    try {
      await deletePhotoApi(albumId, photoId);

      setPhotos((current) => current.filter((photo) => photo.id !== photoId));
      toast.success('Photo supprimée');
    } catch (error) {
      console.error('DELETE PHOTO ERROR:', error);
      toast.error('Erreur lors de la suppression de la photo');
    }
  }
  return {
    photos,
    setPhotos,
    uploading,
    uploadPhotos,
    deletePhoto,
  };
}
