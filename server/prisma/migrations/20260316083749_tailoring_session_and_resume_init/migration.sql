-- CreateEnum
CREATE TYPE "TailoringSessionStatus" AS ENUM ('PENDING', 'REVIEWED', 'TAILORED');

-- CreateTable
CREATE TABLE "TailoringSession" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "suggestions" JSONB NOT NULL,
    "acceptedSuggestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dismissedSuggestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "TailoringSessionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TailoringSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TailoredResume" (
    "id" TEXT NOT NULL,
    "tailoringSessionId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TailoredResume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TailoringSession_userId_idx" ON "TailoringSession"("userId");

-- CreateIndex
CREATE INDEX "TailoringSession_applicationId_idx" ON "TailoringSession"("applicationId");

-- CreateIndex
CREATE INDEX "TailoredResume_userId_idx" ON "TailoredResume"("userId");

-- CreateIndex
CREATE INDEX "TailoredResume_applicationId_idx" ON "TailoredResume"("applicationId");

-- CreateIndex
CREATE INDEX "TailoredResume_tailoringSessionId_idx" ON "TailoredResume"("tailoringSessionId");

-- AddForeignKey
ALTER TABLE "TailoringSession" ADD CONSTRAINT "TailoringSession_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailoringSession" ADD CONSTRAINT "TailoringSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailoredResume" ADD CONSTRAINT "TailoredResume_tailoringSessionId_fkey" FOREIGN KEY ("tailoringSessionId") REFERENCES "TailoringSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailoredResume" ADD CONSTRAINT "TailoredResume_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailoredResume" ADD CONSTRAINT "TailoredResume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;
