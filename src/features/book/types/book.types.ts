export type BookPhoto = {
  id: string;
  bookId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  storageKeyOriginal: string;
  storageKeyThumbnail: string;
  position: number;
  createdAt: Date | string;
};

export type Book = {
  id: string;
  userId: string;
  title: string;
  shareToken: string;
  photos: BookPhoto[];
  createdAt: Date | string;
  updatedAt: Date | string;
};
