import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Book, BookPhoto } from '@/features/book/types/book.types';
import {
  deleteBookPhoto as deleteBookPhotoApi,
  getBook as getBookApi,
  regenerateBookShareToken,
  updateBook as updateBookApi,
  uploadBookPhotos as uploadBookPhotosApi,
} from '@/features/book/services/book.api';

export function useBook() {
  const [book, setBook] = useState<Book | null>(null);
  const [photos, setPhotos] = useState<BookPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingTitle, setSavingTitle] = useState(false);
  const [regeneratingShareToken, setRegeneratingShareToken] = useState(false);

  async function loadBook() {
    try {
      const data = await getBookApi();

      setBook(data.book);
      setPhotos(data.book.photos);
    } catch (error) {
      console.error('LOAD BOOK ERROR:', error);
      toast.error('Impossible de charger le book');
    } finally {
      setLoading(false);
    }
  }

  async function uploadPhotos(files: File[]) {
    if (files.length === 0) return;

    try {
      setUploading(true);

      const formData = new FormData();

      files.forEach((file) => {
        formData.append('photos', file);
      });

      const data = await uploadBookPhotosApi(formData);

      setPhotos((current) => [...current, ...data.photos]);
      toast.success('Photos ajoutées au book');
    } catch (error) {
      console.error('UPLOAD BOOK PHOTOS ERROR:', error);
      toast.error("Impossible d'ajouter les photos au book");
    } finally {
      setUploading(false);
    }
  }

  async function deletePhoto(photoId: string) {
    const confirmed = confirm('Supprimer cette photo du book ?');
    if (!confirmed) return;

    try {
      await deleteBookPhotoApi(photoId);

      setPhotos((current) => current.filter((photo) => photo.id !== photoId));
      toast.success('Photo supprimée du book');
    } catch (error) {
      console.error('DELETE BOOK PHOTO ERROR:', error);
      toast.error('Impossible de supprimer la photo');
    }
  }

  async function updateTitle(title: string) {
    const cleanTitle = title.trim();

    if (cleanTitle.length < 2) {
      toast.error('Le nom du book doit contenir au moins 2 caractères');
      return;
    }

    try {
      setSavingTitle(true);

      const data = await updateBookApi({ title: cleanTitle });

      setBook((current) =>
        current
          ? {
              ...current,
              title: data.book.title,
            }
          : data.book,
      );
      toast.success('Nom du book mis à jour');
    } catch (error) {
      console.error('UPDATE BOOK TITLE ERROR:', error);
      toast.error('Impossible de renommer le book');
    } finally {
      setSavingTitle(false);
    }
  }

  async function regenerateShareToken() {
    try {
      setRegeneratingShareToken(true);

      const data = await regenerateBookShareToken();

      setBook((current) =>
        current
          ? {
              ...current,
              shareToken: data.book.shareToken,
            }
          : data.book,
      );
      toast.success('Lien du book régénéré');
    } catch (error) {
      console.error('REGENERATE BOOK TOKEN ERROR:', error);
      toast.error('Impossible de régénérer le lien');
    } finally {
      setRegeneratingShareToken(false);
    }
  }

  async function copyShareLink(appUrl: string) {
    if (!book?.shareToken) return;

    await navigator.clipboard.writeText(`${appUrl}/b/${book.shareToken}`);
    toast.success('Lien du book copié');
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadBook();
  }, []);

  return {
    book,
    photos,
    loading,
    uploading,
    savingTitle,
    regeneratingShareToken,
    uploadPhotos,
    deletePhoto,
    updateTitle,
    regenerateShareToken,
    copyShareLink,
  };
}
