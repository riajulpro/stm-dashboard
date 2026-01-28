import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { processMonthlyData, processMonthlyGrowth } from "./statistics-helper";

export const demoDashboardStats = {
  overview: {
    totalStudents: 0,
    totalBatches: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    attendanceRate: 0,
  },
  charts: {
    monthlyRevenue: [],
    studentGrowth: [],
    courseEnrollments: [],
    attendanceStats: [],
  },
  recentActivities: {
    recentStudents: [],
    topPerformers: [],
    recentFeedbacks: [],
  },
  upcomingClasses: [],
};

export async function getDashbaordStats() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const teacherId = session.user.id;

    // Fetch all statistics in parallel
    const [
      totalStudents,
      totalBatches,
      totalCourses,
      activeCourses,
      totalRevenue,
      pendingPayments,
      recentStudents,
      attendanceStats,
      courseEnrollments,
      monthlyRevenue,
      studentGrowth,
      topPerformers,
      upcomingClasses,
      recentFeedbacks,
    ] = await Promise.all([
      // Total Students
      db.student.count({
        where: { teacherId },
      }),

      // Total Batches
      db.batch.count({
        where: { teacherId },
      }),

      // Total Courses
      db.course.count({
        where: { teacherId },
      }),

      // Active Courses
      db.course.count({
        where: {
          teacherId,
          isActive: true,
        },
      }),

      // Total Revenue (sum of all paid amounts)
      db.courseSubscription.aggregate({
        where: {
          student: {
            teacherId,
          },
        },
        _sum: {
          amountPaid: true,
        },
      }),

      // Pending Payments (sum of unpaid amounts)
      db.courseSubscription.findMany({
        where: {
          student: {
            teacherId,
          },
          paymentStatus: {
            in: ["pending", "partial"],
          },
        },
        include: {
          course: true,
        },
      }),

      // Recent Students (last 5)
      db.student.findMany({
        where: { teacherId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          batch: true,
        },
      }),

      // Attendance Stats (last 30 days)
      db.attendance.groupBy({
        by: ["status"],
        where: {
          student: {
            teacherId,
          },
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
        _count: {
          status: true,
        },
      }),

      // Course Enrollments
      db.courseSubscription.groupBy({
        by: ["courseId"],
        where: {
          student: {
            teacherId,
          },
          isActive: true,
        },
        _count: {
          courseId: true,
        },
      }),

      // Monthly Revenue (last 6 months)
      db.courseSubscription.findMany({
        where: {
          student: {
            teacherId,
          },
          enrolledDate: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
        select: {
          enrolledDate: true,
          amountPaid: true,
        },
      }),

      // Student Growth (last 6 months)
      db.student.groupBy({
        by: ["createdAt"],
        where: {
          teacherId,
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
        _count: {
          id: true,
        },
      }),

      // Top Performers (based on average marks)
      db.result.groupBy({
        by: ["studentId"],
        where: {
          student: {
            teacherId,
          },
        },
        _avg: {
          marksObtained: true,
        },
        orderBy: {
          _avg: {
            marksObtained: "desc",
          },
        },
        take: 5,
      }),

      // Upcoming Classes (next 7 days)
      db.routine.findMany({
        where: {
          batch: {
            teacherId,
          },
          isActive: true,
        },
        include: {
          course: true,
          batch: true,
        },
        take: 10,
      }),

      // Recent Feedbacks
      db.feedback.findMany({
        where: {
          student: {
            teacherId,
          },
        },
        orderBy: {
          feedbackDate: "desc",
        },
        take: 5,
        include: {
          student: true,
        },
      }),
    ]);

    // Calculate pending payment amount
    const pendingAmount = pendingPayments.reduce(
      (
        sum: number,
        subscription: { course: { courseFee: number }; amountPaid: number },
      ) => {
        const remaining =
          subscription.course.courseFee - subscription.amountPaid;
        return sum + remaining;
      },
      0,
    );

    // Process monthly revenue data
    const monthlyRevenueData = processMonthlyData(monthlyRevenue, "amountPaid");

    // Process student growth data
    const studentGrowthData = processMonthlyGrowth(studentGrowth);

    // Get course details for enrollments
    const courseIds = courseEnrollments.map(
      (e: { courseId: string }) => e.courseId,
    );
    const courses = await db.course.findMany({
      where: {
        id: { in: courseIds },
      },
      select: {
        id: true,
        title: true,
      },
    });

    const courseEnrollmentData = courseEnrollments.map(
      (enrollment: { courseId: string; _count: { courseId: number } }) => {
        const course = courses.find(
          (c: { id: string; title: string }) => c.id === enrollment.courseId,
        );
        return {
          courseName: course?.title || "Unknown",
          enrollments: enrollment._count.courseId,
        };
      },
    );

    // Get student details for top performers
    const topPerformerIds = topPerformers.map(
      (p: { studentId: string }) => p.studentId,
    );
    const topStudents = await db.student.findMany({
      where: {
        id: { in: topPerformerIds },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
      },
    });

    const topPerformersData = topPerformers.map(
      (performer: {
        studentId: string;
        _avg: { marksObtained: number | null };
      }) => {
        const student = topStudents.find(
          (s: { id: string; name: string; avatar: string | null }) =>
            s.id === performer.studentId,
        );
        return {
          studentId: performer.studentId,
          name: student?.name || "Unknown",
          avatar: student?.avatar,
          averageMarks: performer._avg.marksObtained?.toFixed(2) || "0",
        };
      },
    );

    // Process attendance stats
    const attendanceData = {
      present:
        attendanceStats.find(
          (a: { status: string; _count: { status: number } }) =>
            a.status === "present",
        )?._count.status || 0,
      absent:
        attendanceStats.find(
          (a: { status: string; _count: { status: number } }) =>
            a.status === "absent",
        )?._count.status || 0,
      late:
        attendanceStats.find(
          (a: { status: string; _count: { status: number } }) =>
            a.status === "late",
        )?._count.status || 0,
      excused:
        attendanceStats.find(
          (a: { status: string; _count: { status: number } }) =>
            a.status === "excused",
        )?._count.status || 0,
    };

    const totalAttendance = Object.values(attendanceData).reduce(
      (a, b) => a + b,
      0,
    );
    const attendanceRate =
      totalAttendance > 0
        ? ((attendanceData.present / totalAttendance) * 100).toFixed(1)
        : "0";

    // Prepare response
    const stats = {
      overview: {
        totalStudents,
        totalBatches,
        totalCourses,
        activeCourses,
        totalRevenue: totalRevenue._sum.amountPaid || 0,
        pendingPayments: pendingAmount,
        attendanceRate: parseFloat(attendanceRate),
      },
      charts: {
        monthlyRevenue: monthlyRevenueData,
        studentGrowth: studentGrowthData,
        courseEnrollments: courseEnrollmentData,
        attendanceStats: [
          { status: "Present", count: attendanceData.present },
          { status: "Absent", count: attendanceData.absent },
          { status: "Late", count: attendanceData.late },
          { status: "Excused", count: attendanceData.excused },
        ],
      },
      recentActivities: {
        recentStudents: recentStudents.map(
          (student: {
            id: string;
            name: string;
            batch: { batchName: string };
            createdAt: Date;
            avatar: string | null;
          }) => ({
            id: student.id,
            name: student.name,
            batch: student.batch.batchName,
            joinedDate: student.createdAt,
            avatar: student.avatar,
          }),
        ),
        topPerformers: topPerformersData,
        recentFeedbacks: recentFeedbacks.map(
          (feedback: {
            id: string;
            student: { name: string };
            feedback: string;
            rating: number | null;
            feedbackDate: Date;
          }) => ({
            id: feedback.id,
            studentName: feedback.student.name,
            feedback: feedback.feedback,
            rating: feedback.rating,
            date: feedback.feedbackDate,
          }),
        ),
      },
      upcomingClasses: upcomingClasses.map(
        (routine: {
          id: string;
          course: { title: string };
          batch: { batchName: string };
          schedule: Array<{ day: string; startTime: string; endTime: string }>;
        }) => ({
          id: routine.id,
          courseName: routine.course.title,
          batchName: routine.batch.batchName,
          schedule: routine.schedule,
        }),
      ),
    };

    return stats;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return demoDashboardStats;
  }
}
