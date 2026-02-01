/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { api } from "@/lib/axios-instance";
import { toast } from "sonner";
import { Student } from "@prisma/client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ---------------- SCHEMAS ----------------

const createSchema = z.object({
  studentIds: z.array(z.string()).min(1, "Select at least one student"),
  date: z.date(),
  status: z.enum(["present", "absent", "late", "excused"]),
  remarks: z.string().optional(),
});

const editSchema = z.object({
  studentId: z.string(),
  date: z.date(),
  status: z.enum(["present", "absent", "late", "excused"]),
  remarks: z.string().optional(),
});

type FormValues = z.infer<typeof createSchema> | z.infer<typeof editSchema>;

// ---------------- TYPES ----------------

interface Attendance {
  id: string;
  studentId: string;
  date: string | Date;
  status: string;
  remarks: string | null;
}

interface Props {
  children?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  attendance?: Attendance;
  students?: Partial<Student>[];
}

// ---------------- CONSTANTS ----------------

const STATUSES = ["present", "absent", "late", "excused"];

// ---------------- COMPONENT ----------------

export default function AttendanceDialog({
  children,
  open,
  onOpenChange,
  mode = "create",
  attendance,
  students,
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(mode === "edit" ? editSchema : createSchema),
    defaultValues:
      mode === "edit"
        ? {
            studentId: "",
            date: new Date(),
            status: "present",
            remarks: "",
          }
        : {
            studentIds: [],
            date: new Date(),
            status: "present",
            remarks: "",
          },
  });

  useEffect(() => {
    if (mode === "edit" && attendance) {
      form.reset({
        studentId: attendance.studentId,
        date:
          attendance.date instanceof Date
            ? attendance.date
            : new Date(attendance.date),
        status: attendance.status as any,
        remarks: attendance.remarks || "",
      });
    }
  }, [mode, attendance, form]);

  // ---------------- SUBMIT ----------------

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      if (mode === "create") {
        const createData = data as z.infer<typeof createSchema>;

        await api.post("/attendances/bulk", {
          studentIds: createData.studentIds,
          date: createData.date.toISOString(),
          status: createData.status,
          remarks: createData.remarks || null,
        });

        toast.success("Attendance recorded successfully");
      }

      if (mode === "edit" && attendance) {
        const editData = data as z.infer<typeof editSchema>;
        await api.patch("/attendances", {
          id: attendance.id,
          studentId: editData.studentId,
          date: editData.date.toISOString(),
          status: editData.status,
          remarks: editData.remarks || null,
        });
        toast.success("Attendance updated successfully");
      }

      onOpenChange(false);
      router.refresh();
      form.reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to save attendance");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Attendance" : "Record Attendance"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update a single attendance record"
              : "Record attendance for multiple students"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* STUDENTS */}
            {mode === "create" ? (
              <FormField
                control={form.control}
                name="studentIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Students *</FormLabel>
                    <div className="border rounded-md p-3 space-y-2 max-h-56 overflow-y-auto">
                      {students?.map((s) => (
                        <label key={s.id} className="flex gap-2 items-center">
                          <input
                            type="checkbox"
                            checked={field.value?.includes(s.id as string)}
                            onChange={(e) =>
                              field.onChange(
                                e.target.checked
                                  ? [...field.value, s.id]
                                  : field.value.filter((id) => id !== s.id),
                              )
                            }
                          />
                          {s.name} – {s.studentId}
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {/* DATE */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {format(field.value, "PPP")}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            {/* STATUS */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <select {...field} className="w-full border rounded p-2">
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </FormItem>
              )}
            />

            {/* REMARKS */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "edit" ? "Update Attendance" : "Record Attendance"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
