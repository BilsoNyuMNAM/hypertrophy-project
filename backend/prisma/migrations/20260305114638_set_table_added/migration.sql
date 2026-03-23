-- CreateTable
CREATE TABLE "Set" (
    "id" SERIAL NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "rir" INTEGER NOT NULL,
    "exerciselogId" INTEGER NOT NULL,

    CONSTRAINT "Set_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_exerciselogId_fkey" FOREIGN KEY ("exerciselogId") REFERENCES "Exerciselog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
