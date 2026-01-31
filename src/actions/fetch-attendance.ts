/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/prisma";

/**
 * Fetch all attendance records with filters
 */
export async function fetchAttendances(filters?: {
  studentId?: string;
  date?: Date;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const where: any = {};

    if (filters?.studentId) {
      where.studentId = filters.studentId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    // Date filtering
    if (filters?.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    const attendances = await db.attendance.findMany({
      where,
      select: {
        id: true,
        studentId: true,
        date: true,
        status: true,
        remarks: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            email: true,
            avatar: true,
            batch: {
              select: {
                id: true,
                batchName: true,
                batchYear: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return attendances;
  } catch (error) {
    console.error("Error fetching attendances:", error);
    throw new Error("Failed to fetch attendance records");
  }
}

/**
 * Fetch a single attendance record by ID
 */
export async function fetchAttendanceById(id: string) {
  try {
    const attendance = await db.attendance.findUnique({
      where: { id },
      select: {
        id: true,
        studentId: true,
        date: true,
        status: true,
        remarks: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            email: true,
            avatar: true,
            batch: {
              select: {
                id: true,
                batchName: true,
                batchYear: true,
              },
            },
          },
        },
      },
    });

    return attendance;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throw new Error("Failed to fetch attendance record");
  }
}

/**
 * Fetch attendance records for a specific student
 */
export async function fetchAttendanceByStudent(studentId: string) {
  try {
    const attendances = await db.attendance.findMany({
      where: { studentId },
      select: {
        id: true,
        studentId: true,
        date: true,
        status: true,
        remarks: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            email: true,
            avatar: true,
            batch: {
              select: {
                id: true,
                batchName: true,
                batchYear: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return attendances;
  } catch (error) {
    console.error("Error fetching student attendances:", error);
    throw new Error("Failed to fetch student attendance records");
  }
}

/**
 * Fetch attendance records for a specific date
 */
export async function fetchAttendanceByDate(date: Date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const attendances = await db.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        studentId: true,
        date: true,
        status: true,
        remarks: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            email: true,
            avatar: true,
            batch: {
              select: {
                id: true,
                batchName: true,
                batchYear: true,
              },
            },
          },
        },
      },
      orderBy: {
        student: {
          name: "asc",
        },
      },
    });

    return attendances;
  } catch (error) {
    console.error("Error fetching date attendances:", error);
    throw new Error("Failed to fetch attendance records for date");
  }
}

/**
 * Fetch attendance statistics for a student
 */
export async function fetchAttendanceStats(
  studentId: string,
  startDate?: Date,
  endDate?: Date,
) {
  try {
    const where: any = { studentId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const [total, present, absent, late, excused] = await Promise.all([
      db.attendance.count({ where }),
      db.attendance.count({ where: { ...where, status: "present" } }),
      db.attendance.count({ where: { ...where, status: "absent" } }),
      db.attendance.count({ where: { ...where, status: "late" } }),
      db.attendance.count({ where: { ...where, status: "excused" } }),
    ]);

    return {
      total,
      present,
      absent,
      late,
      excused,
      presentPercentage: total > 0 ? ((present / total) * 100).toFixed(2) : "0",
      absentPercentage: total > 0 ? ((absent / total) * 100).toFixed(2) : "0",
    };
  } catch (error) {
    console.error("Error fetching attendance stats:", error);
    throw new Error("Failed to fetch attendance statistics");
  }
}

/**
 * Fetch attendance records for a date range
 */
export async function fetchAttendanceByDateRange(
  startDate: Date,
  endDate: Date,
) {
  try {
    const attendances = await db.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        studentId: true,
        date: true,
        status: true,
        remarks: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            email: true,
            avatar: true,
            batch: {
              select: {
                id: true,
                batchName: true,
                batchYear: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return attendances;
  } catch (error) {
    console.error("Error fetching attendance by date range:", error);
    throw new Error("Failed to fetch attendance records for date range");
  }
}

/**
 * Check if attendance exists for a student on a specific date
 */
export async function checkAttendanceExists(studentId: string, date: Date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await db.attendance.findFirst({
      where: {
        studentId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return attendance !== null;
  } catch (error) {
    console.error("Error checking attendance:", error);
    throw new Error("Failed to check attendance record");
  }
}

/**
 * Fetch attendance summary by batch
 */
export async function fetchAttendanceSummaryByBatch(
  batchId: string,
  date?: Date,
) {
  try {
    const where: any = {
      student: {
        batchId,
      },
    };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const attendances = await db.attendance.findMany({
      where,
      select: {
        id: true,
        studentId: true,
        date: true,
        status: true,
        remarks: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            email: true,
            avatar: true,
            batch: {
              select: {
                id: true,
                batchName: true,
                batchYear: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          date: "desc",
        },
        {
          student: {
            name: "asc",
          },
        },
      ],
    });

    return attendances;
  } catch (error) {
    console.error("Error fetching batch attendance summary:", error);
    throw new Error("Failed to fetch batch attendance summary");
  }
}
