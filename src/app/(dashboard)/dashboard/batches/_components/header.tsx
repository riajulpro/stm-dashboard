"use client";

import { Button } from "@/components/ui/button";
import { CreateBatchDialog } from "./create-batch-dialog";
import { Plus } from "lucide-react";

const BatchesHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Batches</h1>
        <p className="text-muted-foreground">
          Create and manage your student batches
        </p>
      </div>
      <CreateBatchDialog>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create Batch
        </Button>
      </CreateBatchDialog>
    </div>
  );
};

export default BatchesHeader;
