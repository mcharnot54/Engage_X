-- AlterTable
ALTER TABLE "observation_reasons" ADD COLUMN     "apiConfiguration" JSONB,
ADD COLUMN     "externalApiUrl" TEXT;
