"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/axios-instance";

const batchFormSchema = z.object({
  batchName: z
    .string()
    .min(1, "Batch name is required")
    .max(100, "Batch name is too long"),
  batchYear: z.string().optional(),
});

type BatchFormValues = z.infer<typeof batchFormSchema>;

export function CreateBatchDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      batchName: "",
      batchYear: "",
    },
  });

  async function onSubmit(data: BatchFormValues) {
    setLoading(true);

    try {
      const response = await api.post("/batches", data);

      if (!response.status.toString().startsWith("2")) {
        throw new Error("Failed to create batch");
      }

      toast("Success!", {
        description: response.statusText || "Batch created successfully",
      });

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast("Error!", {
        description:
          error instanceof Error ? error.message : "Failed to create batch",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Create New Batch</DialogTitle>
          <DialogDescription>
            Add a new batch to organize and manage your students effectively
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="batchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch Name*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Morning Batch A, SSC 2024"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    A unique name to identify this batch
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="batchYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch Year</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 2024, 2024-2025"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    Academic year or session (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Batch
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
