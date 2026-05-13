import { PrismaTransaction } from "./types";

export async function completeUpdate(
  weekId: number,
  completed: boolean,
  prisma: PrismaTransaction
) {
  const result = await prisma.week.updateMany({
    where: {
      id: weekId,
      deletedAt: null,
    },
    data: {
      completed: completed,
    },
  });
  if (result.count === 0) {
    throw new Error("WEEK_NOT_FOUND");
  }
  return result;
}
