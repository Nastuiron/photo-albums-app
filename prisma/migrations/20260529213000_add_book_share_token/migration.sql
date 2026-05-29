-- AlterTable
ALTER TABLE "Book" ADD COLUMN "shareToken" TEXT;

-- Backfill existing books.
UPDATE "Book"
SET "shareToken" = md5(random()::text || clock_timestamp()::text || "id") || md5("id" || random()::text)
WHERE "shareToken" IS NULL;

-- Make token required and unique.
ALTER TABLE "Book" ALTER COLUMN "shareToken" SET NOT NULL;
CREATE UNIQUE INDEX "Book_shareToken_key" ON "Book"("shareToken");
