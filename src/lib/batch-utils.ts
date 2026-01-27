import { db } from "@/lib/prisma";

/**
 * Get batch by ID with validation
 */
export async function getBatchById(batchId: string, teacherId: string) {
  const batch = await db.batch.findFirst({
    where: {
      id: batchId,
      teacherId,
    },
    select: {
      id: true,
      batchName: true,
      batchYear: true,
    },
  });

  return batch;
}
