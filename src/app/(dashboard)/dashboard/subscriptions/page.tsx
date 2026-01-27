import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import CreateSubscriptionButton from "./_components/create-subscription-button";

import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { subscriptionColumns } from "@/data-columns/subscription/subscription";
import { DataTable } from "@/components/shared/data-table";

async function getSubscriptions(teacherId: string) {
  return await await db.courseSubscription.findMany({
    where: {
      course: {
        teacherId,
      },
    },
    include: {
      student: true,
      course: true,
    },
  });
}

async function getCourses(teacherId: string) {
  return await db.course.findMany({
    where: {
      teacherId: teacherId,
    },
    select: {
      id: true,
      title: true,
    },
  });
}

async function getStudents() {
  return await db.student.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}

export default async function SubscriptionPage() {
  const session = await auth();
  const teacherId = session?.user?.id;

  const [subscription, courses, students] = await Promise.all([
    getSubscriptions(teacherId!),
    getCourses(teacherId!),
    getStudents(),
  ]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
            <p className="text-muted-foreground">
              Manage your subscriptions and their information
            </p>
          </div>
          <CreateSubscriptionButton courses={courses} students={students} />
        </div>

        {/* Students Table */}
        <Suspense fallback={<Spinner />}>
          <DataTable columns={subscriptionColumns} data={subscription} />
        </Suspense>
      </div>
    </div>
  );
}
