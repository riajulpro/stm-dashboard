"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import CourseDialog from "./course-dialog";

function CreateCourseButton() {
  const [open, setOpen] = useState(false);

  return (
    <CourseDialog open={open} onOpenChange={setOpen}>
      <Button size="lg" className="gap-2">
        <Plus className="h-5 w-5" />
        Add Course
      </Button>
    </CourseDialog>
  );
}

export default CreateCourseButton;
