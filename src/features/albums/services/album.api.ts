export async function getAlbums() {
  const response = await fetch('/api/albums');

  if (!response.ok) {
    throw new Error('Impossible de récupérer les albums.');
  }

  return response.json();
}

export async function createAlbum(data: {
  title: string;
  description?: string;
}) {
  const response = await fetch('/api/albums', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Impossible de créer l'album.");
  }

  return response.json();
}

export async function deleteAlbum(albumId: string) {
  const response = await fetch(`/api/albums/${albumId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error("Impossible de supprimer l'album.");
  }

  return response.json();
}

export async function updateAlbum(
  albumId: string,
  data: {
    title?: string;
    description?: string | null;
    isShared?: boolean;
    coverPhotoId?: string | null;
  },
) {
  const response = await fetch(`/api/albums/${albumId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Impossible de modifier l'album.");
  }

  return response.json();
}

export async function regenerateShareToken(albumId: string) {
  const response = await fetch(`/api/albums/${albumId}/share-token`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Impossible de régénérer le lien de partage.');
  }

  return response.json();
}
