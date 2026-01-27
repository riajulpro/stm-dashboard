import { CourseSubscription } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

export const subscriptionColumns: ColumnDef<CourseSubscription>[] = [
  {
    accessorKey: "id",
    header: "Subscription ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "studentId",
    header: "Student ID",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("studentId")}</div>
    ),
  },
  {
    accessorKey: "courseId",
    header: "Course ID",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("courseId")}</div>
    ),
  },
  {
    accessorKey: "subscriptionDate",
    header: "Subscription Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue<string>("subscriptionDate"));
      return <div className="font-medium">{date.toLocaleDateString()}</div>;
    },
  },
];
