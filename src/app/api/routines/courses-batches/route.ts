import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await Promise.all([
    db.course.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    db.batch.findMany({
      select: {
        id: true,
        batchName: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return NextResponse.json(data);
}
