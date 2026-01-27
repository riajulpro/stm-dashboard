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
import { CreateCourseSchema } from "./zod-schema";

import { z } from "zod";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { Course } from "@prisma/client";

type TCreateCourse = z.infer<typeof CreateCourseSchema>;

interface Props {
  children?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "edit" | "create";
  course?: Course;
}

const CourseDialog = ({
  children,
  open,
  onOpenChange,
  mode = "create",
  course,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<TCreateCourse>({
    defaultValues: {
      title: "",
      description: "",
      courseFee: 0,
      courseDuration: 1,
      courseFor: "",
      isActive: true,
      teacherId: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && course) {
      form.reset({
        title: course.title,
        description: course.description || "",
        courseFee: course.courseFee,
        courseDuration: course.courseDuration,
        courseFor: course.courseFor,
        isActive: course.isActive,
        teacherId: course.teacherId,
      });
    } else {
      form.reset();
    }
  }, [mode, course, form]);

  const onSubmit = async (data: TCreateCourse) => {
    setLoading(true);
    try {
      if (mode === "create") {
        await api.post("/courses", data);
        toast.success("Course created successfully");
      } else if (mode === "edit" && course) {
        await api.patch(`/courses/${course.id}`, data);
        toast.success("Course updated successfully");
      }

      form.reset();
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-175 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Course" : "Add New Course"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update student information"
              : "Fill in the student details to add them to your batch"}
          </DialogDescription>
        </DialogHeader>

        {/* Form will be added there */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            {/* Form fields go here */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>
                  <Input placeholder="Enter course title" {...field} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Description</FormLabel>
                  <Textarea
                    placeholder="Enter course description"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courseFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Fee</FormLabel>
                  <Input
                    type="number"
                    placeholder="Enter course fee"
                    {...field}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courseDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Duration (in months)</FormLabel>
                  <Input
                    type="number"
                    placeholder="Enter course duration"
                    {...field}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courseFor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course For</FormLabel>
                  <Input
                    placeholder="Enter target audience for the course"
                    {...field}
                  />
                </FormItem>
              )}
            />

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
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                // disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "edit" ? "Update Course" : "Add Course"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseDialog;
