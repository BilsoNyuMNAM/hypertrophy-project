-- AlterTable
ALTER TABLE "Mesocycle" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Week" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Frequency" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "StartingVolume" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Session" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Exerciselog" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Set" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SessionMuscleFeedback" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Mesocycle_deletedAt_idx" ON "Mesocycle"("deletedAt");

-- CreateIndex
CREATE INDEX "Week_deletedAt_idx" ON "Week"("deletedAt");

-- CreateIndex
CREATE INDEX "Frequency_deletedAt_idx" ON "Frequency"("deletedAt");

-- CreateIndex
CREATE INDEX "StartingVolume_deletedAt_idx" ON "StartingVolume"("deletedAt");

-- CreateIndex
CREATE INDEX "Session_deletedAt_idx" ON "Session"("deletedAt");

-- CreateIndex
CREATE INDEX "Exerciselog_deletedAt_idx" ON "Exerciselog"("deletedAt");

-- CreateIndex
CREATE INDEX "Set_deletedAt_idx" ON "Set"("deletedAt");

-- CreateIndex
CREATE INDEX "SessionMuscleFeedback_deletedAt_idx" ON "SessionMuscleFeedback"("deletedAt");
