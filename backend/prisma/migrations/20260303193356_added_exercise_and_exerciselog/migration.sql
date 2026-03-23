-- CreateTable
CREATE TABLE "Exercise" (
    "id" SERIAL NOT NULL,
    "exercise_name" TEXT NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exerciselog" (
    "id" SERIAL NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,

    CONSTRAINT "Exerciselog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_exercise_name_key" ON "Exercise"("exercise_name");

-- AddForeignKey
ALTER TABLE "Exerciselog" ADD CONSTRAINT "Exerciselog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exerciselog" ADD CONSTRAINT "Exerciselog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
