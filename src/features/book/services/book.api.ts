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

export async function deleteBookPhoto(photoId: string) {
  const response = await fetch(`/api/book/photos/${photoId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Impossible de supprimer la photo du book.');
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
