import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Album } from '@/features/albums/types/album.types';
import {
  createAlbum as createAlbumApi,
  deleteAlbum as deleteAlbumApi,
  getAlbums as getAlbumsApi,
} from '@/features/albums/services/album.api';

export function useAlbums(onRefresh?: () => void) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function loadAlbums() {
    try {
      const data = await getAlbumsApi();
      setAlbums(data.albums);
    } catch (error) {
      console.error('LOAD ALBUMS ERROR:', error);
      toast.error('Impossible de charger les albums');
    } finally {
      setLoading(false);
    }
  }

  async function createAlbum(data: { title: string; description?: string }) {
    if (!data.title.trim()) return;

    try {
      setCreating(true);

      await createAlbumApi(data);
      await loadAlbums();

      toast.success('Album créé');
    } catch (error) {
      console.error('CREATE ALBUM ERROR:', error);
      toast.error("Impossible de créer l'album");
    } finally {
      setCreating(false);
    }
  }

  async function deleteAlbum(albumId: string) {
    const confirmed = confirm('Supprimer cet album ?');
    if (!confirmed) return;

    try {
      await deleteAlbumApi(albumId);

      setAlbums((current) => current.filter((album) => album.id !== albumId));
      toast.success('Album supprimé');
    } catch (error) {
      console.error('DELETE ALBUM ERROR:', error);
      toast.error("Impossible de supprimer l'album");
    }
  }

  useEffect(() => {
    async function fetchAlbums() {
      await loadAlbums();
    }

    void fetchAlbums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    albums,
    loading,
    creating,
    createAlbum,
    deleteAlbum,
    reloadAlbums: loadAlbums,
  };
}
