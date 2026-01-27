"use client";

import { Course } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/axios-instance";
import { Button } from "@/components/ui/button";

import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CourseDialog from "@/app/(dashboard)/dashboard/courses/_components/course-dialog";

type Props = {
  course: Course;
};

export function CourseActionsCell({ course }: Props) {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);

    try {
      const response = await api.delete(`/courses/${course.id}`);

      if (response.status === 200) {
        toast("Success!", {
          description: response.data.message || "Course deleted successfully",
        });

        router.refresh();
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      toast("Error", {
        description:
          error instanceof Error ? error.message : "Failed to delete batch",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => {}}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault(); // ← very important
              setOpenEditDialog(true);
            }}
          >
            <div className="flex items-center gap-0.5">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
            disabled={deleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CourseDialog
        course={course}
        mode="edit"
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
      />
    </>
  );
}
