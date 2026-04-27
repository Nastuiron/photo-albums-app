/*
  Warnings:

  - You are about to drop the `AdminUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,slug]` on the table `Album` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Album` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Album_slug_key";

-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "AdminUser";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Album_userId_idx" ON "Album"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Album_userId_slug_key" ON "Album"("userId", "slug");

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
