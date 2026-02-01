import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import CreateAttendanceButton from "./_components/create-attendance-button";
import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { DataTable } from "@/components/shared/data-table";
import { attendanceColumns } from "@/data-columns/attendance/attendance-column";

async function getStudents(teacherId: string) {
  return await db.student.findMany({
    where: {
      teacherId,
    },
    select: {
      id: true,
      studentId: true,
      name: true,
    },
  });
}

async function getAttendance(teacherId: string) {
  return await db.attendance.findMany({
    where: {
      student: {
        teacherId,
      },
    },
    include: {
      student: {
        include: {
          batch: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });
}

export default async function AttendancePage() {
  const session = await auth();
  const teacherId = session?.user.id as string;

  const [students, attendances] = await Promise.all([
    getStudents(teacherId),
    getAttendance(teacherId),
  ]);

  const normalized = attendances.map((a) => ({
    ...a,
    student: {
      ...a.student,
      email: a.student.email ?? "",
    },
  }));

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
            <p className="text-muted-foreground">
              Manage your attendance and their information
            </p>
          </div>
          <CreateAttendanceButton students={students} />
        </div>
        <Suspense fallback={<Spinner />}>
          <DataTable columns={attendanceColumns} data={normalized} />
        </Suspense>
      </div>
    </div>
  );
}
