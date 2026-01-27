"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import SubscriptionDialog from "./subscription-dialog";

interface Props {
  courses: { id: string; title: string }[];
  students: { id: string; name: string }[];
}

function CreateSubscriptionButton({ courses, students }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <SubscriptionDialog
      open={open}
      onOpenChange={setOpen}
      courses={courses}
      students={students}
    >
      <Button size="lg" className="gap-2">
        <Plus className="h-5 w-5" />
        Add Subscription
      </Button>
    </SubscriptionDialog>
  );
}

export default CreateSubscriptionButton;
