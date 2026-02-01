import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";

import { db } from "@/lib/prisma";

import { addMonths } from "date-fns";

// GET all subscriptions

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const studentId = searchParams.get("studentId");

    const courseId = searchParams.get("courseId");

    const isActive = searchParams.get("isActive");

    const paymentStatus = searchParams.get("paymentStatus");

    const subscriptions = await db.courseSubscription.findMany({
      where: {
        student: {
          teacherId: session.user.id,
        },

        ...(studentId && { studentId }),

        ...(courseId && { courseId }),

        ...(isActive !== null && { isActive: isActive === "true" }),

        ...(paymentStatus && { paymentStatus }),
      },

      include: {
        student: {
          select: {
            id: true,

            studentId: true,

            name: true,

            avatar: true,

            email: true,

            phone: true,

            batch: {
              select: {
                id: true,

                batchName: true,
              },
            },
          },
        },

        course: {
          select: {
            id: true,

            title: true,

            courseFee: true,

            courseDuration: true,

            courseFor: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ subscriptions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);

    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },

      { status: 500 },
    );
  }
}

// POST create new subscription
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      studentId,
      courseId,
      enrolledDate,
      validTill,
      paymentStatus,
      amountPaid,
      isActive,
    } = body;

    // Validate required fields
    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: "Student and course are required" },
        { status: 400 },
      );
    }

    // Verify student ownership
    const student = await db.student.findFirst({
      where: {
        id: studentId,
        teacherId: session.user.id,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Verify course ownership
    const course = await db.course.findFirst({
      where: {
        id: courseId,
        teacherId: session.user.id,
      },
    });

    console.log({ course });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if subscription already exists

    const existingSubscription = await db.courseSubscription.findFirst({
      where: {
        studentId,
        courseId,
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: "Student is already enrolled in this course" },
        { status: 400 },
      );
    }

    // Calculate validTill if not provided (enrolledDate + courseDuration)
    const enrollDate = enrolledDate ? new Date(enrolledDate) : new Date();

    const calculatedValidTill = validTill
      ? new Date(validTill)
      : addMonths(enrollDate, course.courseDuration);

    // Validate amountPaid

    const paidAmount = amountPaid !== undefined ? parseFloat(amountPaid) : 0;

    if (paidAmount < 0 || paidAmount > course.courseFee) {
      return NextResponse.json(
        { error: "Invalid amount paid" },

        { status: 400 },
      );
    }

    // Determine payment status based on amount paid
    let finalPaymentStatus = paymentStatus || "pending";

    if (paidAmount === 0) {
      finalPaymentStatus = "pending";
    } else if (paidAmount >= course.courseFee) {
      finalPaymentStatus = "paid";
    } else {
      finalPaymentStatus = "partial";
    }

    const subscription = await db.courseSubscription.create({
      data: {
        studentId,
        courseId,
        enrolledDate: enrollDate,
        validTill: calculatedValidTill,
        paymentStatus: finalPaymentStatus,
        amountPaid: paidAmount,
        isActive: isActive !== undefined ? isActive : true,
      },

      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            avatar: true,
            batch: {
              select: {
                id: true,
                batchName: true,
              },
            },
          },
        },

        course: {
          select: {
            id: true,
            title: true,
            courseFee: true,
            courseDuration: true,
          },
        },
      },
    });

    return NextResponse.json(
      { subscription, message: "Subscription created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating subscription:", error);

    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 },
    );
  }
}
