import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import CreateAttendanceButton from "./_components/create-attendance-button";

export default async function AttendancePage() {
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
          <CreateAttendanceButton />
        </div>

        {/* Students Table */}
        <Suspense fallback={<Spinner />}>
          {/* <DataTable columns={courseColumns} data={courses} /> */}
        </Suspense>
      </div>
    </div>
  );
}
