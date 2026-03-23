-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "muscleId" INTEGER;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_muscleId_fkey" FOREIGN KEY ("muscleId") REFERENCES "Muscle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
