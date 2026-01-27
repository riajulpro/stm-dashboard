"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Student } from "@prisma/client";
import { StudentActionsCell } from "./students-action-cell";

interface IStudent extends Student {
  _count: {
    courseSubscriptions: number;
    attendances: number;
    results: number;
  };
  batch: {
    id: string;
    batchName: string;
    batchYear: string | null;
  };
}

export const studentColumns: ColumnDef<IStudent>[] = [
  {
    accessorKey: "studentId",
    header: "Student ID",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("studentId")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const student = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={student.avatar || undefined} />
            <AvatarFallback>
              {student.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{student.name}</div>
            <div className="text-xs text-muted-foreground">{student.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "institutionName",
    header: "Institution",
  },
  {
    accessorKey: "class",
    header: "Class",
  },
  {
    accessorKey: "batch",
    header: "Batch",
    cell: ({ row }) => {
      const batch = row.original.batch;

      return (
        <div className="flex items-center gap-2">
          <span>{batch.batchName}</span>
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
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("gender")}</Badge>
    ),
  },
  {
    accessorKey: "_count",
    header: "Courses",
    cell: ({ row }) => {
      const count = row.original._count;
      return <div className="text-center">{count.courseSubscriptions}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original;
      // const meta = table.options.meta as any;

      return <StudentActionsCell student={student} />;
    },
  },
];
