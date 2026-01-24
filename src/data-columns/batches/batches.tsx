import { ColumnDef } from "@tanstack/react-table";
import { Batch } from "@prisma/client";
import { BatchActionsCell } from "./batch-action-cell";

export const batchesColumns: ColumnDef<Batch>[] = [
  {
    accessorKey: "batchName",
    header: "Name",
  },
  {
    accessorKey: "batchYear",
    header: "Year",
  },
  {
    id: "actions",
    cell: ({ row }) => <BatchActionsCell batch={row.original} />,
  },
];
