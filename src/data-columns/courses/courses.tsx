"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Course } from "@prisma/client";
import { CourseActionsCell } from "./course-action-cell";

interface ICourse extends Course {
  teacher: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    subscriptions: number;
    routines: number;
    results: number;
  };
}

export const courseColumns: ColumnDef<ICourse>[] = [
  {
    accessorKey: "title",
    header: "Course",
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div>
          <div className="font-medium">{course.title}</div>
          {course.description && (
            <div className="text-xs text-muted-foreground line-clamp-1">
              {course.description}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "courseFor",
    header: "For",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.getValue("courseFor")}</Badge>
    ),
  },
  {
    accessorKey: "courseFee",
    header: "Fee",
    cell: ({ row }) => {
      const fee = row.getValue<number>("courseFee");
      return <div className="font-medium">৳ {fee}</div>;
    },
  },
  {
    accessorKey: "courseDuration",
    header: "Duration",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("courseDuration")} months</Badge>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue<boolean>("isActive");
      return (
        <Badge variant={isActive ? "default" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "teacher",
    header: "Teacher",
    cell: ({ row }) => {
      const teacher = row.original.teacher;
      return (
        <div>
          <div className="font-medium">{teacher.name}</div>
          <div className="text-xs text-muted-foreground">{teacher.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "_count",
    header: "Students",
    cell: ({ row }) => {
      const count = row.original._count;
      return (
        <div className="text-center font-medium">{count.subscriptions}</div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const course = row.original;
      return <CourseActionsCell course={course} />;
    },
  },
];
