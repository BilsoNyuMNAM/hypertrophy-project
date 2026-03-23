/*
  Warnings:

  - Made the column `muscleId` on table `Exercise` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_muscleId_fkey";

-- AlterTable
ALTER TABLE "Exercise" ALTER COLUMN "muscleId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_muscleId_fkey" FOREIGN KEY ("muscleId") REFERENCES "Muscle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
