-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Album" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "shareToken" TEXT NOT NULL,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "coverPhotoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "storageKeyOriginal" TEXT NOT NULL,
    "storageKeyLarge" TEXT,
    "storageKeyThumbnail" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Album_slug_key" ON "Album"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Album_shareToken_key" ON "Album"("shareToken");

-- CreateIndex
CREATE INDEX "Photo_albumId_idx" ON "Photo"("albumId");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;
