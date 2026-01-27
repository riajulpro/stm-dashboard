import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateStudentId } from "@/lib/student-id-generator";
import { getBatchById } from "@/lib/batch-utils";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { batchId } = body;

    if (!batchId) {
      return NextResponse.json(
        { error: "Batch ID is required" },
        { status: 400 },
      );
    }

    const batch = await getBatchById(batchId, session.user.id);

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const studentId = await generateStudentId(batch.batchName, session.user.id);

    return NextResponse.json({ studentId }, { status: 200 });
  } catch (error) {
    console.error("Error previewing student ID:", error);
    return NextResponse.json(
      { error: "Failed to generate student ID preview" },
      { status: 500 },
    );
  }
}
