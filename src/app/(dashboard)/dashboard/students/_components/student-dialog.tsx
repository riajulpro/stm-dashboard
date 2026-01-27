/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { api } from "@/lib/axios-instance";
import { Button } from "@/components/ui/button";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

const studentFormSchema = z.object({
  studentId: z.string().optional(),
  name: z.string().min(1, "Name is required").max(100),
  institutionName: z.string().min(1, "Institution name is required"),
  class: z.string().min(1, "Class is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  batchId: z.string().min(1, "Batch is required"),
  avatar: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

type Batch = {
  id: string;
  batchName: string;
  batchYear: string | null;
};

type Student = {
  id: string;
  studentId: string;
  name: string;
  institutionName: string;
  class: string;
  gender: string;
  batchId: string;
  avatar?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: Date | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
};

interface StudentDialogProps {
  children?: React.ReactNode;
  batches: Batch[];
  student?: Student;
  mode?: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentDialog({
  children,
  batches,
  student,
  mode = "create",
  open,
  onOpenChange,
}: StudentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [previewId, setPreviewId] = useState<string>("");
  const [generatingId, setGeneratingId] = useState(false);

  const router = useRouter();

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      studentId: "",
      name: "",
      institutionName: "",
      class: "",
      gender: "Male",
      batchId: "",
      avatar: "",
      email: "",
      phone: "",
      address: "",
      dateOfBirth: "",
      guardianName: "",
      guardianPhone: "",
    },
  });

  // Reset form when student prop changes or dialog opens
  useEffect(() => {
    if (student && mode === "edit") {
      form.reset({
        studentId: student.studentId,
        name: student.name,
        institutionName: student.institutionName,
        class: student.class,
        gender: student.gender as "Male" | "Female" | "Other",
        batchId: student.batchId,
        avatar: student.avatar || "",
        email: student.email || "",
        phone: student.phone || "",
        address: student.address || "",
        dateOfBirth: student.dateOfBirth
          ? format(new Date(student.dateOfBirth), "yyyy-MM-dd")
          : "",
        guardianName: student.guardianName || "",
        guardianPhone: student.guardianPhone || "",
      });
    } else {
      form.reset({
        studentId: "",
        name: "",
        institutionName: "",
        class: "",
        gender: "Male",
        batchId: "",
        avatar: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        guardianName: "",
        guardianPhone: "",
      });
    }
  }, [student, mode, form, open]);

  useEffect(() => {
    const subscription = form.watch(async (value, { name }) => {
      if (name === "batchId" && value.batchId && mode === "create") {
        setGeneratingId(true);

        try {
          const response = await api.post("/students/preview-id", {
            batchId: value.batchId,
          });

          setPreviewId(response.data.studentId);
        } catch (error) {
          console.error("Failed to preview student ID:", error);
        } finally {
          setGeneratingId(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, mode]);

  async function onSubmit(data: StudentFormValues) {
    setLoading(true);

    try {
      if (mode === "edit" && student) {
        // Update existing student
        const response = await api.patch(`/students/${student.id}`, data);
        toast.success(response.data.message || "Student updated successfully");
      } else {
        // Create new student
        const response = await api.post("/students", data);
        toast.success(response.data.message || "Student created successfully");
      }

      form.reset();
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
          `Failed to ${mode === "edit" ? "update" : "create"} student`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-175 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Student" : "Add New Student"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update student information"
              : "Fill in the student details to add them to your batch"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="batchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select batch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {batches.map((batch) => (
                            <SelectItem key={batch.id} value={batch.id}>
                              {batch.batchName}
                              {batch.batchYear && ` (${batch.batchYear})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {mode === "create"
                          ? "Select the batch to which the student will be added"
                          : "Student's batch cannot be changed"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Student ID
                        {mode === "create" && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (Auto-generated, optional)
                          </span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder={
                              mode === "create"
                                ? previewId || "Select batch to preview ID"
                                : "Student ID"
                            }
                            {...field}
                            disabled={
                              loading || (mode === "create" && generatingId)
                            }
                          />
                          {mode === "create" && generatingId && (
                            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        {mode === "create"
                          ? "Leave empty for auto-generation or enter custom ID"
                          : "Cannot be changed after creation"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter full name"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="institutionName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="School/College name"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Class 10"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="student@example.com"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+880..."
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter full address"
                          {...field}
                          disabled={loading}
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Guardian Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Guardian Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guardianName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guardian Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Parent/Guardian name"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guardianPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guardian Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+880..."
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                {mode === "edit" ? "Update Student" : "Add Student"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
