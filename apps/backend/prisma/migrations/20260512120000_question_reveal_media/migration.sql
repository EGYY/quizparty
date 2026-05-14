-- AlterTable
ALTER TABLE "Question"
ADD COLUMN     "mediaStartMs" INTEGER,
ADD COLUMN     "mediaEndMs" INTEGER,
ADD COLUMN     "mediaPosterUrl" TEXT,
ADD COLUMN     "mediaPrompt" TEXT,
ADD COLUMN     "revealMediaUrl" TEXT,
ADD COLUMN     "revealMediaType" "MediaType",
ADD COLUMN     "revealMediaAlt" TEXT,
ADD COLUMN     "revealMediaStartMs" INTEGER,
ADD COLUMN     "revealMediaEndMs" INTEGER,
ADD COLUMN     "revealMediaPosterUrl" TEXT,
ADD COLUMN     "revealMediaPrompt" TEXT;
