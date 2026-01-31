"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import AttendanceDialog from "./attendance-dialog";

function CreateAttendanceButton() {
  const [open, setOpen] = useState(false);

  return (
    <AttendanceDialog open={open} onOpenChange={setOpen}>
      <Button size="lg" className="gap-2">
        <Plus className="h-5 w-5" />
        Add Attendance
      </Button>
    </AttendanceDialog>
  );
}

export default CreateAttendanceButton;
