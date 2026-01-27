import { DataTable } from "@/components/shared/data-table";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import CreateCourseButton from "./_components/create-course-button";
import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { courseColumns } from "@/data-columns/courses/courses";

export default async function CoursePage() {
  const session = await auth();
  const teacherId = session?.user.id;

  const courses = await db.course.findMany({
    where: {
      teacherId,
    },
    include: {
      teacher: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: {
          subscriptions: true,
          routines: true,
          results: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
            <p className="text-muted-foreground">
              Manage your courses and their information
            </p>
          </div>
          <CreateCourseButton />
        </div>

        {/* Students Table */}
        <Suspense fallback={<Spinner />}>
          <DataTable columns={courseColumns} data={courses} />
        </Suspense>
      </div>
    </div>
  );
}
