import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";

// GET all batches
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const batches = await db.batch.findMany({
      where: {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ batches }, { status: 200 });
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json(
      { error: "Failed to fetch batches" },
      { status: 500 },
    );
  }
}

// POST create new batch
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { batchName, batchYear } = body;

    if (!batchName || batchName.trim() === "") {
      return NextResponse.json(
        { error: "Batch name is required" },
        { status: 400 },
      );
    }

    const batch = await db.batch.create({
      data: {
        batchName: batchName.trim(),
        batchYear: batchYear?.trim() || null,
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

    return NextResponse.json(
      { batch, message: "Batch created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating batch:", error);
    return NextResponse.json(
      { error: "Failed to create batch" },
      { status: 500 },
    );
  }
}
