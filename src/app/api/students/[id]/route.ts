import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";

// GET single student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const student = await db.student.findFirst({
      where: {
        id,
        teacherId: session.user.id,
      },
      include: {
        batch: {
          select: {
            id: true,
            batchName: true,
            batchYear: true,
          },
        },
        courseSubscriptions: {
          include: {
            course: true,
          },
        },
        _count: {
          select: {
            attendances: true,
            results: true,
            feedbacks: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ student }, { status: 200 });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 },
    );
  }
}

// PATCH update student
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const existingStudent = await db.student.findFirst({
      where: {
        id,
        teacherId: session.user.id,
      },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // If studentId is being changed, check for duplicates
    if (body.studentId && body.studentId !== existingStudent.studentId) {
      const duplicate = await db.student.findFirst({
        where: {
          studentId: body.studentId,
          teacherId: session.user.id,
          id: { not: id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Student ID already exists" },
          { status: 400 },
        );
      }
    }

    // If batchId is being changed, verify batch ownership
    if (body.batchId && body.batchId !== existingStudent.batchId) {
      const batch = await db.batch.findFirst({
        where: {
          id: body.batchId,
          teacherId: session.user.id,
        },
      });

      if (!batch) {
        return NextResponse.json({ error: "Batch not found" }, { status: 404 });
      }
    }

    const student = await db.student.update({
      where: { id },
      data: {
        ...(body.studentId && { studentId: body.studentId }),
        ...(body.name && { name: body.name }),
        ...(body.institutionName && { institutionName: body.institutionName }),
        ...(body.class && { class: body.class }),
        ...(body.gender && { gender: body.gender }),
        ...(body.batchId && { batchId: body.batchId }),
        ...(body.avatar !== undefined && { avatar: body.avatar || null }),
        ...(body.email !== undefined && { email: body.email || null }),
        ...(body.phone !== undefined && { phone: body.phone || null }),
        ...(body.address !== undefined && { address: body.address || null }),
        ...(body.dateOfBirth !== undefined && {
          dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        }),
        ...(body.guardianName !== undefined && {
          guardianName: body.guardianName || null,
        }),
        ...(body.guardianPhone !== undefined && {
          guardianPhone: body.guardianPhone || null,
        }),
      },
      include: {
        batch: {
          select: {
            id: true,
            batchName: true,
            batchYear: true,
          },
        },
      },
    });

    return NextResponse.json(
      { student, message: "Student updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 },
    );
  }
}

// DELETE student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existingStudent = await db.student.findFirst({
      where: {
        id,
        teacherId: session.user.id,
      },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    await db.student.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Student deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 },
    );
  }
}
