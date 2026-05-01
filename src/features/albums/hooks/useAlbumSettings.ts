import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateAlbum as updateAlbumApi } from '@/features/albums/services/album.api';

export function useAlbumSettings(
  albumId: string,
  initialTitle: string,
  onRefresh?: () => void,
) {
  const [title, setTitle] = useState(initialTitle);
  const [savingTitle, setSavingTitle] = useState(false);

  async function updateAlbumTitle() {
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      toast.error('Le nom de l’album ne peut pas être vide');
      return;
    }

    if (cleanTitle === initialTitle) return;

    try {
      setSavingTitle(true);

      const data = await updateAlbumApi(albumId, {
        title: cleanTitle,
      });

      setTitle(data.album.title);
      toast.success('Album renommé');
      onRefresh?.();
    } catch (error) {
      console.error('UPDATE TITLE ERROR:', error);
      toast.error('Impossible de renommer l’album');
    } finally {
      setSavingTitle(false);
    }
  }

  async function setCoverPhoto(photoId: string) {
    try {
      await updateAlbumApi(albumId, {
        coverPhotoId: photoId,
      });

      toast.success('Couverture mise à jour');
      onRefresh?.();
    } catch (error) {
      console.error('SET COVER ERROR:', error);
      toast.error('Erreur lors du changement de couverture');
    }
  }

  return {
    title,
    setTitle,
    savingTitle,
    updateAlbumTitle,
    setCoverPhoto,
  };
}
