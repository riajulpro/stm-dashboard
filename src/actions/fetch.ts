import { db } from "@/lib/prisma";

export async function fetchCourses() {
  return await db.course.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function fetchBatches() {
  return await db.batch.findMany({
    select: {
      id: true,
      batchName: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
