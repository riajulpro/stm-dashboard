/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Valid attendance statuses
const VALID_STATUSES = ["present", "absent", "late", "excused"];

// PUT - Update an existing attendance record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, studentId, date, status, remarks } = body;

    // Validation
    if (!id) {
      return NextResponse.json(
        { error: "id is required for update" },
        { status: 400 },
      );
    }

    // Check if attendance exists
    const existingAttendance = await db.attendance.findUnique({
      where: { id },
    });

    if (!existingAttendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 },
      );
    }

    // Build update data object
    const updateData: any = {};

    if (studentId) {
      // Verify student exists
      const studentExists = await db.student.findUnique({
        where: { id: studentId },
      });
      if (!studentExists) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 },
        );
      }
      updateData.studentId = studentId;
    }

    if (date) {
      updateData.date = new Date(date);
    }

    if (status) {
      // Validate status
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          {
            error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
          },
          { status: 400 },
        );
      }
      updateData.status = status;
    }

    if (remarks !== undefined) {
      updateData.remarks = remarks || null;
    }

    // Update attendance
    const attendance = await db.attendance.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(attendance, { status: 200 });
  } catch (error: any) {
    console.error("PUT Error:", error);

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
      { error: "Failed to update attendance record" },
      { status: 500 },
    );
  }
}

// PATCH - Partial update (e.g., change status only)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required for patch" },
        { status: 400 },
      );
    }

    // Check if attendance exists
    const existingAttendance = await db.attendance.findUnique({
      where: { id },
    });

    if (!existingAttendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 },
      );
    }

    // Validate status if provided
    if (updates.status && !VALID_STATUSES.includes(updates.status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Convert date if provided
    if (updates.date) {
      updates.date = new Date(updates.date);
    }

    // Update attendance
    const attendance = await db.attendance.update({
      where: { id },
      data: updates,
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

    return NextResponse.json(attendance, { status: 200 });
  } catch (error: any) {
    console.error("PATCH Error:", error);

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
      { error: "Failed to patch attendance record" },
      { status: 500 },
    );
  }
}

// DELETE - Delete an attendance record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id is required for deletion" },
        { status: 400 },
      );
    }

    // Check if attendance exists
    const existingAttendance = await db.attendance.findUnique({
      where: { id },
    });

    if (!existingAttendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 },
      );
    }

    // Delete attendance
    await db.attendance.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Attendance record deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete attendance record" },
      { status: 500 },
    );
  }
}
