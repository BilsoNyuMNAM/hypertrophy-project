import { PrismaTransaction } from "./types";

export async function completeUpdate(
  weekId: number,
  completed: boolean,
  prisma: PrismaTransaction
) {
  const result = await prisma.week.update({
    where: {
      id: weekId,
    },
    data: {
      completed: completed,
    },
  });
  return result;
}