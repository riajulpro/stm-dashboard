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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
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

// Zod Schema
const routineScheduleSchema = z.object({
  day: z.string().min(1, "Day is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

const routineSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  batchId: z.string().min(1, "Batch is required"),
  schedule: z
    .array(routineScheduleSchema)
    .min(1, "At least one schedule is required"),
  isActive: z.boolean(),
});

type RoutineFormValues = z.infer<typeof routineSchema>;

interface RoutineSchedule {
  day: string;
  startTime: string;
  endTime: string;
}

interface Routine {
  id: string;
  courseId: string;
  batchId: string;
  schedule: RoutineSchedule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  children?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "edit" | "create";
  routine?: Routine;
  courses?: { id: string; title: string }[];
  batches?: { id: string; batchName: string }[];
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const RoutineDialog = ({
  children,
  open,
  onOpenChange,
  mode = "create",
  routine,
  courses,
  batches,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<RoutineFormValues, any, RoutineFormValues>({
    resolver: zodResolver(routineSchema),
    defaultValues: {
      courseId: "",
      batchId: "",
      schedule: [{ day: "Monday", startTime: "", endTime: "" }],
      isActive: true,
    },
  });

  // Reset form when mode or routine changes
  useEffect(() => {
    if (mode === "edit" && routine) {
      form.reset({
        courseId: routine.courseId,
        batchId: routine.batchId,
        schedule: routine.schedule,
        isActive: routine.isActive,
      });
    } else {
      form.reset({
        courseId: "",
        batchId: "",
        schedule: [{ day: "Monday", startTime: "", endTime: "" }],
        isActive: true,
      });
    }
  }, [mode, routine, form]);

  const onSubmit = async (data: RoutineFormValues) => {
    setLoading(true);
    try {
      if (mode === "create") {
        await api.post("/routines", data);
        toast.success("Routine created successfully");
      } else if (mode === "edit" && routine) {
        await api.patch(`/routines/${routine.id}`, {
          id: routine.id,
          ...data,
        });
        toast.success("Routine updated successfully");
      }

      form.reset();
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error?.response?.data?.error || "Failed to save routine";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addScheduleSlot = () => {
    const currentSchedule = form.getValues("schedule");
    form.setValue("schedule", [
      ...currentSchedule,
      { day: "Monday", startTime: "", endTime: "" },
    ]);
  };

  const removeScheduleSlot = (index: number) => {
    const currentSchedule = form.getValues("schedule");
    if (currentSchedule.length > 1) {
      form.setValue(
        "schedule",
        currentSchedule.filter((_, i) => i !== index),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Routine" : "Add New Routine"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update routine information"
              : "Fill in the routine details to create a new schedule"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            {/* Course Selection */}
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses?.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Batch Selection */}
            <FormField
              control={form.control}
              name="batchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a batch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {batches?.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.batchName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Schedule Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Schedule *</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addScheduleSlot}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Time Slot
                </Button>
              </div>

              {form.watch("schedule").map((_, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-3 relative"
                >
                  {form.watch("schedule").length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeScheduleSlot(index)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}

                  <FormField
                    control={form.control}
                    name={`schedule.${index}.day`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`schedule.${index}.startTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} disabled={loading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`schedule.${index}.endTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} disabled={loading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={field.value ? "active" : "inactive"}
                    onValueChange={(value) =>
                      field.onChange(value === "active")
                    }
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
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
                {mode === "edit" ? "Update Routine" : "Add Routine"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RoutineDialog;
