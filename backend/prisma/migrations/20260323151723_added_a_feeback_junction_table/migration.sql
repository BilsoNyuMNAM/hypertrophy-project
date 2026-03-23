/*
  Warnings:

  - You are about to drop the column `muscleId` on the `Performancefeedback` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `Performancefeedback` table. All the data in the column will be lost.
  - You are about to drop the column `muscleId` on the `Sorenessfeedback` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `Sorenessfeedback` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Performancefeedback" DROP CONSTRAINT "Performancefeedback_muscleId_fkey";

-- DropForeignKey
ALTER TABLE "Performancefeedback" DROP CONSTRAINT "Performancefeedback_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "Sorenessfeedback" DROP CONSTRAINT "Sorenessfeedback_muscleId_fkey";

-- DropForeignKey
ALTER TABLE "Sorenessfeedback" DROP CONSTRAINT "Sorenessfeedback_sessionId_fkey";

-- AlterTable
ALTER TABLE "Performancefeedback" DROP COLUMN "muscleId",
DROP COLUMN "sessionId";

-- AlterTable
ALTER TABLE "Sorenessfeedback" DROP COLUMN "muscleId",
DROP COLUMN "sessionId";

-- CreateTable
CREATE TABLE "SessionMuscleFeedback" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "muscleId" INTEGER NOT NULL,
    "sorenessfeedbackId" INTEGER NOT NULL,
    "performancefeedbackId" INTEGER NOT NULL,

    CONSTRAINT "SessionMuscleFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionMuscleFeedback_sessionId_muscleId_key" ON "SessionMuscleFeedback"("sessionId", "muscleId");

-- AddForeignKey
ALTER TABLE "SessionMuscleFeedback" ADD CONSTRAINT "SessionMuscleFeedback_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionMuscleFeedback" ADD CONSTRAINT "SessionMuscleFeedback_muscleId_fkey" FOREIGN KEY ("muscleId") REFERENCES "Muscle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionMuscleFeedback" ADD CONSTRAINT "SessionMuscleFeedback_sorenessfeedbackId_fkey" FOREIGN KEY ("sorenessfeedbackId") REFERENCES "Sorenessfeedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionMuscleFeedback" ADD CONSTRAINT "SessionMuscleFeedback_performancefeedbackId_fkey" FOREIGN KEY ("performancefeedbackId") REFERENCES "Performancefeedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
