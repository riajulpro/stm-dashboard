"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import dayjs from "dayjs";
import { SubscriptionPaymentCell } from "./subscription-payment-cell";
import { ISubscription } from "@/types/subscription-type";

export const subscriptionColumns: ColumnDef<ISubscription>[] = [
  {
    accessorKey: "student.studentId",
    header: "Student ID",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.student.studentId}</div>
    ),
  },

  {
    header: "Student",
    cell: ({ row }) => {
      const s = row.original.student;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={s.avatar || undefined} />
            <AvatarFallback>{s.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{s.name}</div>
            <div className="text-xs text-muted-foreground">
              {s.email ?? "No email"}
            </div>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "course.title",
    header: "Course",
  },

  {
    header: "Duration",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original.course.courseDuration} months
      </Badge>
    ),
  },

  {
    header: "Enrolled",
    cell: ({ row }) => dayjs(row.original.enrolledDate).format("DD MMM YYYY"),
  },

  {
    header: "Valid Till",
    cell: ({ row }) => dayjs(row.original.validTill).format("DD MMM YYYY"),
  },

  {
    header: "Payment",
    cell: ({ row }) => (
      <SubscriptionPaymentCell
        subscriptionId={row.original.id}
        amountPaid={row.original.amountPaid}
        paymentStatus={row.original.paymentStatus}
        courseFee={row.original.course.courseFee}
      />
    ),
  },

  {
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge className="bg-green-600">Active</Badge>
      ) : (
        <Badge variant="outline">Expired</Badge>
      ),
  },
];
