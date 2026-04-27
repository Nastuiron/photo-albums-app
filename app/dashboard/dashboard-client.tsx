'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  email: string;
  name: string | null;
};

type Album = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isShared: boolean;
  shareToken: string;
  createdAt: string;
  photos: {
    id: string;
    storageKeyOriginal: string;
    storageKeyThumbnail: string | null;
  }[];
  _count?: {
    photos: number;
  };
};

export default function DashboardClient({ user }: { user: User }) {
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function loadAlbums() {
    const response = await fetch('/api/albums');
    const data = await response.json();

    if (response.ok) {
      setAlbums(data.albums);
    }

    setLoading(false);
  }

  async function createAlbum(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) return;

    setCreating(true);

    const response = await fetch('/api/albums', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description }),
    });

    if (response.ok) {
      setTitle('');
      setDescription('');
      await loadAlbums();
    }

    setCreating(false);
  }

  async function deleteAlbum(albumId: string) {
    const confirmed = confirm('Supprimer cet album ?');
    if (!confirmed) return;

    const response = await fetch(`/api/albums/${albumId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setAlbums((current) => current.filter((album) => album.id !== albumId));
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });

    router.push('/login');
    router.refresh();
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchAlbums() {
      const response = await fetch('/api/albums');
      const data = await response.json();

      if (!cancelled && response.ok) {
        setAlbums(data.albums);
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    fetchAlbums();

    return () => {
      cancelled = true;
    };
  }, []);

  function formatDate(value: string) {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/10 bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm text-zinc-400">Connecté en tant que</p>
            <h1 className="text-xl font-semibold">{user.name || user.email}</h1>
          </div>

          <button
            onClick={logout}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[380px_1fr]">
        <aside className="h-fit rounded-3xl border border-white/10 bg-zinc-900 p-6 lg:sticky lg:top-6">
          <h2 className="text-lg font-semibold">Créer un album</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Ajoute un nouvel album à ta bibliothèque.
          </p>

          <form onSubmit={createAlbum} className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-zinc-300">Titre</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-white/30"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Vacances 2026"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">Description</label>
              <textarea
                className="mt-1 min-h-28 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-white/30"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Quelques mots sur cet album..."
              />
            </div>

            <button
              disabled={creating}
              className="w-full rounded-xl bg-white px-4 py-3 font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
            >
              {creating ? 'Création...' : 'Créer l’album'}
            </button>
          </form>
        </aside>

        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Mes albums</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Gère ta bibliothèque, tes photos et tes liens de partage.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-8 text-zinc-400">
              Chargement des albums...
            </div>
          ) : albums.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-900 p-10 text-center">
              <h3 className="text-lg font-semibold">Aucun album</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Crée ton premier album avec le formulaire à gauche.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {albums.map((album) => (
                <article
                  key={album.id}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 transition hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    {album.photos?.length > 0 ? (
                      <img
                        src={`/api/files/${
                          album.photos[0].storageKeyThumbnail ??
                          album.photos[0].storageKeyOriginal
                        }`}
                        alt={album.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                        <span className="text-3xl">📷</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <h3 className="truncate text-lg font-semibold">
                          {album.title}
                        </h3>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                            album.isShared
                              ? 'bg-emerald-500/10 text-emerald-300'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {album.isShared ? 'Partagé' : 'Privé'}
                        </span>
                      </div>

                      {album.description ? (
                        <p className="line-clamp-2 text-sm text-zinc-400">
                          {album.description}
                        </p>
                      ) : (
                        <p className="text-sm text-zinc-600">
                          Aucune description
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-zinc-500">
                      <span>Créé le {formatDate(album.createdAt)}</span>
                      <span>{album.slug}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/albums/${album.id}`)
                        }
                        className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
                      >
                        Ouvrir
                      </button>

                      <button
                        onClick={() => deleteAlbum(album.id)}
                        className="rounded-xl border border-red-500/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
