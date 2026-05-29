'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Images, Library } from 'lucide-react';
import { logout as logoutApi } from '@/features/auth/services/auth.api';
import type { User } from '@/features/auth/types/user.types';
import { useAlbums } from '@/features/albums/hooks/useAlbums';
import BookPanel from '@/features/book/components/BookPanel';

export default function DashboardClient({
  user,
  appUrl,
}: {
  user: User;
  appUrl: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'albums' | 'book'>('albums');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { albums, loading, creating, createAlbum, deleteAlbum } = useAlbums();

  async function handleLogout() {
    await logoutApi();

    router.push('/login');
    router.refresh();
  }

  function formatDate(value: string | Date) {
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
            onClick={handleLogout}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl overflow-x-hidden px-5 py-8">
        <div className="mb-8 inline-flex rounded-2xl border border-white/10 bg-zinc-900 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('albums')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === 'albums'
                ? 'bg-white text-zinc-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Library size={17} />
            Albums
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('book')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === 'book'
                ? 'bg-white text-zinc-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Images size={17} />
            Book
          </button>
        </div>

        {activeTab === 'book' ? (
          <BookPanel appUrl={appUrl} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
            <aside className="h-fit rounded-3xl border border-white/10 bg-zinc-900 p-6 lg:sticky lg:top-6">
              <h2 className="text-lg font-semibold">Créer un album</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Ajoute un nouvel album à ta bibliothèque.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createAlbum({ title, description });
                  setTitle('');
                  setDescription('');
                }}
                className="mt-6 space-y-4"
              >
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
                  <h2 className="text-3xl font-bold tracking-tight">
                    Mes albums
                  </h2>
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
                        {album.coverPhoto || album.photos?.length > 0 ? (
                          <img
                            src={`/api/files/${
                              album.coverPhoto?.storageKeyThumbnail ??
                              album.coverPhoto?.storageKeyOriginal ??
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
                        <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                          {album._count?.photos} 📷
                        </div>
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
          </div>
        )}
      </section>
    </main>
  );
}
