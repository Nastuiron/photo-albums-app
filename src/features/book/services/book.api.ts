export async function getBook() {
  const response = await fetch('/api/book');

  if (!response.ok) {
    throw new Error('Impossible de récupérer le book.');
  }

  return response.json();
}

export async function uploadBookPhotos(formData: FormData) {
  const response = await fetch('/api/book/photos', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Impossible d'ajouter les photos au book.");
  }

  return response.json();
}

export async function updateBook(data: { title: string }) {
  const response = await fetch('/api/book', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Impossible de modifier le book.');
  }

  return response.json();
}

export async function deleteBookPhoto(photoId: string) {
  const response = await fetch(`/api/book/photos/${photoId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Impossible de supprimer la photo du book.');
  }

  return response.json();
}

export async function reorderBookPhotos(
  photos: {
    id: string;
    position: number;
  }[],
) {
  const response = await fetch('/api/book/photos/reorder', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ photos }),
  });

  if (!response.ok) {
    throw new Error('Erreur lors du changement d’ordre');
  }

  return response.json();
}

export async function regenerateBookShareToken() {
  const response = await fetch('/api/book/share-token', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Impossible de régénérer le lien du book.');
  }

  return response.json();
}
