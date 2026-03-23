-- CreateTable
CREATE TABLE "Sorenessfeedback" (
    "id" SERIAL NOT NULL,
    "soreness_score" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "muscleId" INTEGER,
    "sessionId" INTEGER,

    CONSTRAINT "Sorenessfeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Performancefeedback" (
    "id" SERIAL NOT NULL,
    "performance_score" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "sessionId" INTEGER,
    "muscleId" INTEGER,

    CONSTRAINT "Performancefeedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sorenessfeedback" ADD CONSTRAINT "Sorenessfeedback_muscleId_fkey" FOREIGN KEY ("muscleId") REFERENCES "Muscle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sorenessfeedback" ADD CONSTRAINT "Sorenessfeedback_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performancefeedback" ADD CONSTRAINT "Performancefeedback_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performancefeedback" ADD CONSTRAINT "Performancefeedback_muscleId_fkey" FOREIGN KEY ("muscleId") REFERENCES "Muscle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
