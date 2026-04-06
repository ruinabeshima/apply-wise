-- DropForeignKey
ALTER TABLE "TailoringSession" DROP CONSTRAINT "TailoringSession_applicationId_fkey";

-- AlterTable
ALTER TABLE "TailoringSession" ALTER COLUMN "applicationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TailoringSession" ADD CONSTRAINT "TailoringSession_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;
