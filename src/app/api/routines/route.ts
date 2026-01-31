/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch all routines or a single routine by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const courseId = searchParams.get("courseId");
    const batchId = searchParams.get("batchId");
    const isActive = searchParams.get("isActive");

    // Get single routine by ID
    if (id) {
      const routine = await db.routine.findUnique({
        where: { id },
        include: {
          course: true,
          batch: true,
        },
      });

      if (!routine) {
        return NextResponse.json(
          { error: "Routine not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(routine, { status: 200 });
    }

    // Build filter object for multiple routines
    const where: any = {};

    if (courseId) where.courseId = courseId;
    if (batchId) where.batchId = batchId;
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    // Get all routines with filters
    const routines = await db.routine.findMany({
      where,
      include: {
        course: true,
        batch: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(routines, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch routines" },
      { status: 500 },
    );
  }
}

// POST - Create a new routine
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, batchId, schedule, isActive } = body;

    // Validation
    if (!courseId || !batchId) {
      return NextResponse.json(
        { error: "courseId and batchId are required" },
        { status: 400 },
      );
    }

    if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
      return NextResponse.json(
        { error: "schedule must be a non-empty array" },
        { status: 400 },
      );
    }

    // Validate schedule items
    for (const item of schedule) {
      if (!item.day || !item.startTime || !item.endTime) {
        return NextResponse.json(
          { error: "Each schedule item must have day, startTime, and endTime" },
          { status: 400 },
        );
      }
    }

    // Check if course exists
    const courseExists = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!courseExists) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if batch exists
    const batchExists = await db.batch.findUnique({
      where: { id: batchId },
    });

    if (!batchExists) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Create routine
    const routine = await db.routine.create({
      data: {
        courseId,
        batchId,
        schedule,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        course: true,
        batch: true,
      },
    });

    return NextResponse.json(routine, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create routine" },
      { status: 500 },
    );
  }
}
