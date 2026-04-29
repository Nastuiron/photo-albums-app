export type AlbumPhotoPreview = {
  id: string;
  storageKeyOriginal: string;
  storageKeyThumbnail: string | null;
};

export type Photo = {
  id: string;
  originalName: string;
  storageKeyOriginal: string;
  storageKeyLarge: string | null;
  storageKeyThumbnail: string | null;
  createdAt: Date | string;
};

export type Album = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isShared: boolean;
  shareToken: string;
  createdAt: Date | string;
  coverPhoto: AlbumPhotoPreview | null;
  photos: AlbumPhotoPreview[];
  _count?: {
    photos: number;
  };
};

export type AlbumDetail = Omit<Album, 'photos' | 'coverPhoto'> & {
  coverPhoto?: AlbumPhotoPreview | null;
  photos: Photo[];
};

export type AlbumWithCover = Album & {
  coverPhoto: Photo | null;
  _count?: {
    photos: number;
  };
};
