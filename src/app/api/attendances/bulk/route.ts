import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentIds, date, status, remarks } = body;

    if (!studentIds?.length) {
      return NextResponse.json(
        { error: "No students selected" },
        { status: 400 },
      );
    }

    const attendanceDate = new Date(date);

    await db.$transaction(
      studentIds.map((studentId: string) =>
        db.attendance.upsert({
          where: {
            studentId_date: {
              studentId,
              date: attendanceDate,
            },
          },
          update: {
            status,
            remarks,
          },
          create: {
            studentId,
            date: attendanceDate,
            status,
            remarks,
          },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to record attendance" },
      { status: 500 },
    );
  }
}
