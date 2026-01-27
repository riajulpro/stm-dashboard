"use client";

import { Button } from "@/components/ui/button";
import { StudentDialog } from "./student-dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Batch } from "@prisma/client";

function StudentCreateButton({ batches }: { batches: Batch[] }) {
  const [open, setOpen] = useState(false);

  return (
    <StudentDialog batches={batches} open={open} onOpenChange={setOpen}>
      <Button size="lg" className="gap-2">
        <Plus className="h-5 w-5" />
        Add Student
      </Button>
    </StudentDialog>
  );
}

export default StudentCreateButton;
