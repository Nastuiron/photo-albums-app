import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  regenerateShareToken as regenerateShareTokenApi,
  updateAlbum as updateAlbumApi,
} from '@/features/albums/services/album.api';

export function useAlbumShare(
  albumId: string,
  initialIsShared: boolean,
  initialShareToken: string,
) {
  const [isShared, setIsShared] = useState(initialIsShared);
  const [shareToken, setShareToken] = useState(initialShareToken);

  async function toggleShare() {
    try {
      await updateAlbumApi(albumId, {
        isShared: !isShared,
      });

      setIsShared((current) => !current);
      toast.success(isShared ? 'Partage désactivé' : 'Partage activé');
    } catch (error) {
      console.error('TOGGLE SHARE ERROR:', error);
      toast.error('Impossible de modifier le partage');
    }
  }

  async function regenerateShareToken() {
    try {
      const data = await regenerateShareTokenApi(albumId);

      setShareToken(data.album.shareToken);
      toast.success('Lien régénéré');
    } catch (error) {
      console.error('REGENERATE TOKEN ERROR:', error);
      toast.error('Impossible de régénérer le lien');
    }
  }

  async function copyShareLink(appUrl: string) {
    try {
      await navigator.clipboard.writeText(`${appUrl}/a/${shareToken}`);
      toast.success('Lien copié !');
    } catch {
      toast.error('Impossible de copier');
    }
  }

  return {
    isShared,
    shareToken,
    toggleShare,
    regenerateShareToken,
    copyShareLink,
  };
}
