/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PUT - Update an existing routine
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, courseId, batchId, schedule, isActive } = body;

    // Validation
    if (!id) {
      return NextResponse.json(
        { error: "id is required for update" },
        { status: 400 },
      );
    }

    // Check if routine exists
    const existingRoutine = await db.routine.findUnique({
      where: { id },
    });

    if (!existingRoutine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }

    // Build update data object
    const updateData: any = {};

    if (courseId) {
      // Verify course exists
      const courseExists = await db.course.findUnique({
        where: { id: courseId },
      });
      if (!courseExists) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 },
        );
      }
      updateData.courseId = courseId;
    }

    if (batchId) {
      // Verify batch exists
      const batchExists = await db.batch.findUnique({
        where: { id: batchId },
      });
      if (!batchExists) {
        return NextResponse.json({ error: "Batch not found" }, { status: 404 });
      }
      updateData.batchId = batchId;
    }

    if (schedule) {
      if (!Array.isArray(schedule) || schedule.length === 0) {
        return NextResponse.json(
          { error: "schedule must be a non-empty array" },
          { status: 400 },
        );
      }

      // Validate schedule items
      for (const item of schedule) {
        if (!item.day || !item.startTime || !item.endTime) {
          return NextResponse.json(
            {
              error: "Each schedule item must have day, startTime, and endTime",
            },
            { status: 400 },
          );
        }
      }
      updateData.schedule = schedule;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Update routine
    const routine = await db.routine.update({
      where: { id },
      data: updateData,
      include: {
        course: true,
        batch: true,
      },
    });

    return NextResponse.json(routine, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: "Failed to update routine" },
      { status: 500 },
    );
  }
}

// PATCH - Partial update (e.g., toggle isActive)
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

    // Check if routine exists
    const existingRoutine = await db.routine.findUnique({
      where: { id },
    });

    if (!existingRoutine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }

    // Update routine
    const routine = await db.routine.update({
      where: { id },
      data: updates,
      include: {
        course: true,
        batch: true,
      },
    });

    return NextResponse.json(routine, { status: 200 });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json(
      { error: "Failed to patch routine" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a routine
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

    // Check if routine exists
    const existingRoutine = await db.routine.findUnique({
      where: { id },
    });

    if (!existingRoutine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }

    // Delete routine
    await db.routine.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Routine deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete routine" },
      { status: 500 },
    );
  }
}
