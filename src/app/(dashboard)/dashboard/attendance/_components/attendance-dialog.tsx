/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DialogHeader } from "@/components/ui/dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/axios-instance";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Zod Schema
const attendanceSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  date: z.date({
    message: "Date is required",
  }),
  status: z.enum(["present", "absent", "late", "excused"], {
    message: "Status is required",
  }),
  remarks: z.string().optional(),
});

type AttendanceFormValues = z.infer<typeof attendanceSchema>;

interface Attendance {
  id: string;
  studentId: string;
  date: string | Date;
  status: string;
  remarks: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  student?: {
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

interface Props {
  children?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "edit" | "create";
  attendance?: Attendance;
}

const ATTENDANCE_STATUSES = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "excused", label: "Excused" },
];

const AttendanceDialog = ({
  children,
  open,
  onOpenChange,
  mode = "create",
  attendance,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const router = useRouter();

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      studentId: "",
      date: new Date(),
      status: "present",
      remarks: "",
    },
  });

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadingData(true);
        const response = await api.get("/students");
        setStudents(response.data);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to load students");
      } finally {
        setLoadingData(false);
      }
    };

    if (open) {
      fetchStudents();
    }
  }, [open]);

  // Reset form when mode or attendance changes
  useEffect(() => {
    if (mode === "edit" && attendance) {
      const attendanceDate =
        attendance.date instanceof Date
          ? attendance.date
          : new Date(attendance.date);

      form.reset({
        studentId: attendance.studentId,
        date: attendanceDate,
        status: attendance.status as any,
        remarks: attendance.remarks || "",
      });
    } else {
      form.reset({
        studentId: "",
        date: new Date(),
        status: "present",
        remarks: "",
      });
    }
  }, [mode, attendance, form]);

  const onSubmit = async (data: AttendanceFormValues) => {
    setLoading(true);
    try {
      // Format the date to ISO string for API
      const formattedData = {
        ...data,
        date: data.date.toISOString(),
        remarks: data.remarks || null,
      };

      if (mode === "create") {
        await api.post("/attendances", formattedData);
        toast.success("Attendance recorded successfully");
      } else if (mode === "edit" && attendance) {
        await api.put("/attendances", {
          id: attendance.id,
          ...formattedData,
        });
        toast.success("Attendance updated successfully");
      }

      form.reset();
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error?.response?.data?.error || "Failed to save attendance record";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Attendance" : "Record Attendance"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update attendance information"
              : "Record student attendance for a specific date"}
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-4"
            >
              {/* Student Selection */}
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading || mode === "edit"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} - {student.studentId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Selection */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                            disabled={loading}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Selection */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ATTENDANCE_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remarks */}
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes or comments..."
                        className="resize-none"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === "edit" ? "Update Attendance" : "Record Attendance"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceDialog;
