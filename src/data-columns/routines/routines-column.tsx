"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { RoutineActionsCell } from "./routine-action-cell";
import { RoutineStatusCell } from "./routine-status-cell";
import { RoutineScheduleCell } from "./routine-schedule-cell";

interface RoutineSchedule {
  day: string;
  startTime: string;
  endTime: string;
}

interface IRoutine {
  id: string;
  courseId: string;
  batchId: string;
  schedule: RoutineSchedule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  course: {
    id: string;
    title: string;
    courseFor?: string;
  };
  batch: {
    id: string;
    batchName: string;
    batchYear?: string | null;
  };
}

export const routineColumns: ColumnDef<IRoutine>[] = [
  {
    accessorKey: "course",
    header: "Course",
    cell: ({ row }) => {
      const course = row.original.course;
      return (
        <div className="max-w-50">
          <div className="font-medium truncate">{course.title}</div>
          {course.courseFor && (
            <div className="text-xs text-muted-foreground truncate">
              {course.courseFor}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "batch",
    header: "Batch",
    cell: ({ row }) => {
      const batch = row.original.batch;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{batch.batchName}</span>
          {batch.batchYear && (
            <Badge variant="secondary" className="text-xs">
              {batch.batchYear}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "schedule",
    header: "Schedule",
    cell: ({ row }) => <RoutineScheduleCell schedule={row.original.schedule} />,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <RoutineStatusCell
        routineId={row.original.id}
        initialValue={row.original.isActive}
      />
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <RoutineActionsCell routine={row.original} />,
  },
];
