import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";

// GET single course
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

    const course = await db.course.findFirst({
      where: {
        id,
        teacherId: session.user.id,
      },
      include: {
        subscriptions: {
          include: {
            student: {
              select: {
                id: true,
                studentId: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        routines: {
          include: {
            batch: {
              select: {
                id: true,
                batchName: true,
              },
            },
          },
        },
        _count: {
          select: {
            subscriptions: true,
            routines: true,
            results: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course }, { status: 200 });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 },
    );
  }
}

// PATCH update course
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
    const existingCourse = await db.course.findFirst({
      where: {
        id,
        teacherId: session.user.id,
      },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Validate numbers if provided
    if (
      body.courseFee !== undefined &&
      (isNaN(body.courseFee) || body.courseFee < 0)
    ) {
      return NextResponse.json(
        { error: "Course fee must be a non-negative number" },
        { status: 400 },
      );
    }

    if (
      body.courseDuration !== undefined &&
      (isNaN(body.courseDuration) || body.courseDuration < 1)
    ) {
      return NextResponse.json(
        { error: "Course duration must be at least 1 month" },
        { status: 400 },
      );
    }

    const course = await db.course.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title.trim() }),
        ...(body.description !== undefined && {
          description: body.description?.trim() || null,
        }),
        ...(body.courseFee !== undefined && {
          courseFee: parseFloat(body.courseFee),
        }),
        ...(body.courseDuration !== undefined && {
          courseDuration: parseInt(body.courseDuration),
        }),
        ...(body.courseFor && { courseFor: body.courseFor.trim() }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
      include: {
        _count: {
          select: {
            subscriptions: true,
            routines: true,
            results: true,
          },
        },
      },
    });

    return NextResponse.json(
      { course, message: "Course updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 },
    );
  }
}

// DELETE course
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
    const existingCourse = await db.course.findFirst({
      where: {
        id,
        teacherId: session.user.id,
      },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Optional: Prevent deletion if course has active subscriptions
    if (existingCourse._count.subscriptions > 0) {
      return NextResponse.json(
        { error: "Cannot delete course with active subscriptions" },
        { status: 400 },
      );
    }

    await db.course.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Course deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 },
    );
  }
}
