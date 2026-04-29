export async function uploadPhotos(albumId: string, formData: FormData) {
  const response = await fetch(`/api/albums/${albumId}/photos`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Impossible d'ajouter les photos.");
  }

  return response.json();
}

export async function deletePhoto(albumId: string, photoId: string) {
  const response = await fetch(`/api/albums/${albumId}/photos/${photoId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Impossible de supprimer la photo.');
  }

  return response.json();
}

export async function reorderPhotos(
  albumId: string,
  photos: {
    id: string;
    position: number;
  }[],
) {
  const response = await fetch(`/api/albums/${albumId}/photos/reorder`, {
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
