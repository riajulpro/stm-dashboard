/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Valid attendance statuses
const VALID_STATUSES = ["present", "absent", "late", "excused"];

// GET - Fetch all attendances or a single attendance by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const studentId = searchParams.get("studentId");
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Get single attendance by ID
    if (id) {
      const attendance = await db.attendance.findUnique({
        where: { id },
        include: {
          student: {
            select: {
              id: true,
              studentId: true,
              name: true,
              email: true,
              avatar: true,
              batch: {
                select: {
                  id: true,
                  batchName: true,
                  batchYear: true,
                },
              },
            },
          },
        },
      });

      if (!attendance) {
        return NextResponse.json(
          { error: "Attendance record not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(attendance, { status: 200 });
    }

    // Build filter object for multiple attendances
    const where: any = {};

    if (studentId) where.studentId = studentId;
    if (status) where.status = status;

    // Date filtering
    if (date) {
      // Exact date match (start and end of day)
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (startDate || endDate) {
      // Date range filtering
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Get all attendances with filters
    const attendances = await db.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            email: true,
            avatar: true,
            batch: {
              select: {
                id: true,
                batchName: true,
                batchYear: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(attendances, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance records" },
      { status: 500 },
    );
  }
}

// POST - Create a new attendance record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, date, status, remarks } = body;

    // Validation
    if (!studentId || !date || !status) {
      return NextResponse.json(
        { error: "studentId, date, and status are required" },
        { status: 400 },
      );
    }

    // Validate status
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Check if student exists
    const studentExists = await db.student.findUnique({
      where: { id: studentId },
    });

    if (!studentExists) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check for duplicate attendance (same student, same date)
    const existingAttendance = await db.attendance.findFirst({
      where: {
        studentId,
        date: new Date(date),
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        {
          error:
            "Attendance record already exists for this student on this date",
        },
        { status: 409 },
      );
    }

    // Create attendance
    const attendance = await db.attendance.create({
      data: {
        studentId,
        date: new Date(date),
        status,
        remarks: remarks || null,
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            email: true,
            avatar: true,
            batch: {
              select: {
                id: true,
                batchName: true,
                batchYear: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error: any) {
    console.error("POST Error:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "Attendance record already exists for this student on this date",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create attendance record" },
      { status: 500 },
    );
  }
}
