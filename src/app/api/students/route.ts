import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { getBatchById } from "@/lib/batch-utils";
import { generateStudentId } from "@/lib/student-id-generator";

// GET all students
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");

    const students = await db.student.findMany({
      where: {
        teacherId: session.user.id,
        ...(batchId && { batchId }),
      },
      include: {
        batch: {
          select: {
            id: true,
            batchName: true,
            batchYear: true,
          },
        },
        _count: {
          select: {
            courseSubscriptions: true,
            attendances: true,
            results: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ students }, { status: 200 });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 },
    );
  }
}

// // POST create new student
// export async function POST(request: NextRequest) {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await request.json();
//     const {
//       studentId,
//       name,
//       institutionName,
//       class: studentClass,
//       gender,
//       batchId,
//       avatar,
//       email,
//       phone,
//       address,
//       dateOfBirth,
//       guardianName,
//       guardianPhone,
//     } = body;

//     // Validate required fields
//     if (
//       !studentId ||
//       !name ||
//       !institutionName ||
//       !studentClass ||
//       !gender ||
//       !batchId
//     ) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 },
//       );
//     }

//     // Verify batch ownership
//     const batch = await db.batch.findFirst({
//       where: {
//         id: batchId,
//         teacherId: session.user.id,
//       },
//     });

//     if (!batch) {
//       return NextResponse.json({ error: "Batch not found" }, { status: 404 });
//     }

//     // Check if studentId already exists for this teacher
//     const existingStudent = await db.student.findFirst({
//       where: {
//         studentId,
//         teacherId: session.user.id,
//       },
//     });

//     if (existingStudent) {
//       return NextResponse.json(
//         { error: "Student ID already exists" },
//         { status: 400 },
//       );
//     }

//     const student = await db.student.create({
//       data: {
//         studentId,
//         name,
//         institutionName,
//         class: studentClass,
//         gender,
//         batchId,
//         teacherId: session.user.id,
//         avatar: avatar || null,
//         email: email || null,
//         phone: phone || null,
//         address: address || null,
//         dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
//         guardianName: guardianName || null,
//         guardianPhone: guardianPhone || null,
//       },
//       include: {
//         batch: {
//           select: {
//             id: true,
//             batchName: true,
//             batchYear: true,
//           },
//         },
//       },
//     });

//     return NextResponse.json(
//       { student, message: "Student created successfully" },
//       { status: 201 },
//     );
//   } catch (error) {
//     console.error("Error creating student:", error);
//     return NextResponse.json(
//       { error: "Failed to create student" },
//       { status: 500 },
//     );
//   }
// }

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      institutionName,
      class: studentClass,
      gender,
      batchId,
      avatar,
      email,
      phone,
      address,
      dateOfBirth,
      guardianName,
      guardianPhone,
      studentId: customStudentId, // Optional: allow custom student ID
    } = body;

    // Validate required fields
    if (!name || !institutionName || !studentClass || !gender || !batchId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify batch ownership and get batch details
    const batch = await getBatchById(batchId, session.user.id);

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Generate or use custom student ID
    let studentId: string;

    if (customStudentId) {
      // If custom ID provided, check if it already exists
      const existingStudent = await db.student.findFirst({
        where: {
          studentId: customStudentId,
          teacherId: session.user.id,
        },
      });

      if (existingStudent) {
        return NextResponse.json(
          { error: "Student ID already exists" },
          { status: 400 },
        );
      }

      studentId = customStudentId;
    } else {
      // Auto-generate student ID based on batch
      studentId = await generateStudentId(batch.batchName, session.user.id);
    }

    const student = await db.student.create({
      data: {
        studentId,
        name,
        institutionName,
        class: studentClass,
        gender,
        batchId,
        teacherId: session.user.id,
        avatar: avatar || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        guardianName: guardianName || null,
        guardianPhone: guardianPhone || null,
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
      { student, message: "Student created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 },
    );
  }
}
