"use client";

import { Student } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

export const studentsColumns: ColumnDef<Student>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "institutionName",
    header: "Institution Name",
  },
  {
    accessorKey: "class",
    header: "Class",
  },
  {
    accessorKey: "gender",
    header: "Gender",
  },
  {
    accessorKey: "batchId",
    header: "Batch ID",
  },
  // {
  //   id: "actions",
  //   header: "Actions",
  //   cell: ({ row }) => {
  //     const student = row.original;

  //     return (
  //       <div>
  //         <button>Edit</button>
  //         <button>Delete</button>
  //       </div>
  //     );
  //   },
  // }
];
