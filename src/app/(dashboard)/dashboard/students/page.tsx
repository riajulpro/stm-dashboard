import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DataTable } from "@/components/shared/data-table";
import { studentColumns } from "@/data-columns/students/students";
import StudentCreateButton from "./_components/student-create-button";
import { Batch } from "@prisma/client";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

async function getStudents(teacherId: string) {
  const students = await db.student.findMany({
    where: {
      teacherId,
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

  return students;
}

async function getBatches(teacherId: string) {
  const batches = await db.batch.findMany({
    where: {
      teacherId,
    },
    select: {
      id: true,
      batchName: true,
      batchYear: true,
    },
    orderBy: {
      batchName: "asc",
    },
  });

  return batches;
}

export default async function StudentsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [students, batches] = await Promise.all([
    getStudents(session.user.id),
    getBatches(session.user.id),
  ]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">
              Manage your students and their information
            </p>
          </div>
          <StudentCreateButton batches={batches as Batch[]} />
        </div>

        {/* Students Table */}
        <Suspense fallback={<Spinner />}>
          <DataTable columns={studentColumns} data={students} />
        </Suspense>
      </div>
    </div>
  );
}
