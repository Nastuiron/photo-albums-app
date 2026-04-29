'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  login as loginApi,
  signup as signupApi,
} from '@/features/auth/services/auth.api';

type Mode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signupApi({
          email,
          password,
          name,
        });

        await loginApi({
          email,
          password,
        });
      } else {
        await loginApi({
          email,
          password,
        });
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Une erreur est survenue',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/80 p-8 shadow-2xl">
        <div className="mb-8">
          <p className="text-sm text-zinc-400">Album Photo</p>
          <h1 className="mt-2 text-3xl font-bold">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Gérez vos albums et partagez-les via un lien sécurisé.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-sm text-zinc-300">Nom</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-white/30"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Theo"
              />
            </div>
          )}

          <div>
            <label className="text-sm text-zinc-300">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-white/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-300">Mot de passe</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-white/30"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3 font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-60"
          >
            {loading
              ? 'Chargement...'
              : mode === 'login'
                ? 'Se connecter'
                : 'Créer le compte'}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="mt-6 text-sm text-zinc-400 hover:text-white"
        >
          {mode === 'login'
            ? 'Pas encore de compte ? Créer un compte'
            : 'Déjà un compte ? Se connecter'}
        </button>
      </section>
    </main>
  );
}
