import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";

// GET single batch
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const batch = await db.batch.findFirst({
      where: {
        id: id,
        teacherId: session.user.id,
      },
      include: {
        _count: {
          select: {
            students: true,
            routines: true,
          },
        },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    return NextResponse.json({ batch }, { status: 200 });
  } catch (error) {
    console.error("Error fetching batch:", error);
    return NextResponse.json(
      { error: "Failed to fetch batch" },
      { status: 500 },
    );
  }
}

// PATCH update batch
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { batchName, batchYear } = body;

    // Verify ownership
    const existingBatch = await db.batch.findFirst({
      where: {
        id: id,
        teacherId: session.user.id,
      },
    });

    if (!existingBatch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const batch = await db.batch.update({
      where: {
        id: id,
      },
      data: {
        ...(batchName && { batchName: batchName.trim() }),
        ...(batchYear !== undefined && {
          batchYear: batchYear?.trim() || null,
        }),
      },
      include: {
        _count: {
          select: {
            students: true,
            routines: true,
          },
        },
      },
    });

    return NextResponse.json(
      { batch, message: "Batch updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating batch:", error);
    return NextResponse.json(
      { error: "Failed to update batch" },
      { status: 500 },
    );
  }
}

// DELETE batch
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existingBatch = await db.batch.findFirst({
      where: {
        id: id,
        teacherId: session.user.id,
      },
    });

    if (!existingBatch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    await db.batch.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(
      { message: "Batch deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting batch:", error);
    return NextResponse.json(
      { error: "Failed to delete batch" },
      { status: 500 },
    );
  }
}
