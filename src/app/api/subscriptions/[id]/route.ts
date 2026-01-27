import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";

// GET single subscription
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

    const subscription = await db.courseSubscription.findFirst({
      where: {
        id,
        student: {
          teacherId: session.user.id,
        },
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
            description: true,
            courseFee: true,
            courseDuration: true,
            courseFor: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ subscription }, { status: 200 });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 },
    );
  }
}

// PATCH update subscription
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
    const existingSubscription = await db.courseSubscription.findFirst({
      where: {
        id,
        student: {
          teacherId: session.user.id,
        },
      },
      include: {
        course: true,
      },
    });

    if (!existingSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    // Validate amountPaid if provided
    if (body.amountPaid !== undefined) {
      const paidAmount = parseFloat(body.amountPaid);
      if (
        paidAmount < 0 ||
        paidAmount > existingSubscription.course.courseFee
      ) {
        return NextResponse.json(
          { error: "Invalid amount paid" },
          { status: 400 },
        );
      }

      // Auto-update payment status based on amount
      if (paidAmount === 0) {
        body.paymentStatus = "pending";
      } else if (paidAmount >= existingSubscription.course.courseFee) {
        body.paymentStatus = "paid";
      } else {
        body.paymentStatus = "partial";
      }
    }

    const subscription = await db.courseSubscription.update({
      where: { id },
      data: {
        ...(body.enrolledDate && { enrolledDate: new Date(body.enrolledDate) }),
        ...(body.validTill && { validTill: new Date(body.validTill) }),
        ...(body.paymentStatus && { paymentStatus: body.paymentStatus }),
        ...(body.amountPaid !== undefined && {
          amountPaid: parseFloat(body.amountPaid),
        }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
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
      { subscription, message: "Subscription updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 },
    );
  }
}

// DELETE subscription
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
    const existingSubscription = await db.courseSubscription.findFirst({
      where: {
        id,
        student: {
          teacherId: session.user.id,
        },
      },
    });

    if (!existingSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    await db.courseSubscription.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Subscription deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 },
    );
  }
}
