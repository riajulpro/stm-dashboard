"use client";

import { useState } from "react";
import RoutineDialog from "./routine-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  courses: { id: string; title: string }[];
  batches: { id: string; batchName: string }[];
}

const CreateRoutineButton = ({ courses, batches }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <RoutineDialog
      courses={courses}
      batches={batches}
      open={open}
      onOpenChange={setOpen}
    >
      <Button size="lg" className="gap-2">
        <Plus className="h-5 w-5" />
        Add Routine
      </Button>
    </RoutineDialog>
  );
};

export default CreateRoutineButton;
