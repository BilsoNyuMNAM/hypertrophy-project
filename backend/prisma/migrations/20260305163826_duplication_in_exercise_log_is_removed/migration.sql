/*
  Warnings:

  - A unique constraint covering the columns `[exerciseId,sessionId]` on the table `Exerciselog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Exerciselog_exerciseId_sessionId_key" ON "Exerciselog"("exerciseId", "sessionId");
