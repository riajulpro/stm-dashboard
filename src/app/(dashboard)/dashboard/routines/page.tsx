import { Suspense } from "react";
import CreateRoutineButton from "./_components/create-routine-button";
import { Spinner } from "@/components/ui/spinner";
import { db } from "@/lib/prisma";
import { DataTable } from "@/components/shared/data-table";
import { routineColumns } from "@/data-columns/routines/routines-column";
import { fetchBatches, fetchCourses } from "@/actions/fetch";
import { auth } from "@/lib/auth";

async function fetchRoutines(teacherId: string) {
  const routines = await db.routine.findMany({
    where: {
      course: {
        teacherId,
      },
    },
    select: {
      id: true,
      courseId: true,
      batchId: true,
      schedule: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      course: {
        select: {
          id: true,
          title: true,
          courseFor: true,
        },
      },
      batch: {
        select: {
          id: true,
          batchName: true,
          batchYear: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return routines.map((routine) => ({
    ...routine,
    createdAt: routine.createdAt.toISOString(),
    updatedAt: routine.updatedAt.toISOString(),
  }));
}

export default async function RoutinePage() {
  const session = await auth();
  const teacherId = session?.user.id as string;

  const [courses, batches, routines] = await Promise.all([
    fetchCourses(),
    fetchBatches(),
    fetchRoutines(teacherId),
  ]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Routines</h1>
            <p className="text-muted-foreground">
              Manage your routines and their information here.
            </p>
          </div>
          <CreateRoutineButton courses={courses} batches={batches} />
        </div>

        {/* Students Table */}
        <Suspense fallback={<Spinner />}>
          <DataTable columns={routineColumns} data={routines} />
        </Suspense>
      </div>
    </div>
  );
}
