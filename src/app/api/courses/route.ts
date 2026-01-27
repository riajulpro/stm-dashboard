import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";

// GET all courses
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    const courses = await db.course.findMany({
      where: {
        teacherId: session.user.id,
        ...(isActive !== null && { isActive: isActive === "true" }),
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}

// POST create new course
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      courseFee,
      courseDuration,
      courseFor,
      isActive,
    } = body;

    // Validate required fields
    if (!title || courseFee === undefined || !courseDuration || !courseFor) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate courseFee and courseDuration are numbers
    if (isNaN(courseFee) || isNaN(courseDuration)) {
      return NextResponse.json(
        { error: "Course fee and duration must be valid numbers" },
        { status: 400 },
      );
    }

    if (courseFee < 0 || courseDuration < 1) {
      return NextResponse.json(
        {
          error:
            "Course fee must be non-negative and duration must be at least 1 month",
        },
        { status: 400 },
      );
    }

    const course = await db.course.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        courseFee: parseFloat(courseFee),
        courseDuration: parseInt(courseDuration),
        courseFor: courseFor.trim(),
        isActive: isActive !== undefined ? isActive : true,
        teacherId: session.user.id,
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
      { course, message: "Course created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 },
    );
  }
}
