/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock } from "lucide-react";
import { AttendanceActionsCell } from "./attendance-action-cell";

interface IAttendance {
  id: string;
  studentId: string;
  date: string | Date;
  status: string;
  remarks: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  student: {
    id: string;
    studentId: string;
    name: string;
    email: string;
    avatar: string | null;
    batch: {
      id: string;
      batchName: string;
      batchYear: string | null;
    };
  };
}

// Helper function to get status badge variant
const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "present":
      return "default"; // Green
    case "absent":
      return "destructive"; // Red
    case "late":
      return "secondary"; // Yellow/Orange
    case "excused":
      return "outline"; // Gray
    default:
      return "secondary";
  }
};

// Helper function to format date
const formatDate = (date: string | Date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Helper function to format time
const formatTime = (date: string | Date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const attendanceColumns: ColumnDef<IAttendance>[] = [
  {
    accessorKey: "student",
    header: "Student",
    cell: ({ row }) => {
      const student = row.original.student;
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
            <div className="text-xs text-muted-foreground">
              ID: {student.studentId}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "batch",
    header: "Batch",
    cell: ({ row }) => {
      const batch = row.original.student.batch;
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
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("date") as string | Date;
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatDate(date)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={getStatusBadgeVariant(status) as any}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row }) => {
      const remarks = row.getValue("remarks") as string | null;
      return (
        <div className="max-w-50">
          {remarks ? (
            <span className="text-sm text-muted-foreground truncate block">
              {remarks}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              No remarks
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Recorded At",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string | Date;
      return (
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatTime(createdAt)}</span>
          </div>
          <div className="text-xs">{formatDate(createdAt)}</div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const attendance = row.original;
      return <AttendanceActionsCell attendance={attendance} />;
    },
  },
];
