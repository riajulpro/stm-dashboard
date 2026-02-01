"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import AttendanceDialog from "./attendance-dialog";
import { Student } from "@prisma/client";

interface Props {
  students: Partial<Student>[];
}

function CreateAttendanceButton({ students }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <AttendanceDialog open={open} onOpenChange={setOpen} students={students}>
      <Button size="lg" className="gap-2">
        <Plus className="h-5 w-5" />
        Add Attendance
      </Button>
    </AttendanceDialog>
  );
}

export default CreateAttendanceButton;
