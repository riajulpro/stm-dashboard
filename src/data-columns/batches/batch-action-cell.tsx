"use client";

import { Batch } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/axios-instance";
import { Button } from "@/components/ui/button";
import { Edit2, Trash } from "lucide-react";
import { CreateBatchDialog } from "@/app/(dashboard)/dashboard/batches/_components/create-batch-dialog";

type Props = {
  batch: Batch;
};

export function BatchActionsCell({ batch }: Props) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);

    try {
      const response = await api.delete(`/batches/${batch.id}`);

      if (response.status === 200) {
        toast("Success!", {
          description: response.data.message || "Batch deleted successfully",
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
      <div className="flex gap-2 justify-end">
        <Button
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
          className="text-blue-600"
          size="icon"
          variant="ghost"
        >
          <Edit2 className="h-3 w-3" />
        </Button>

        <Button
          disabled={deleting}
          onClick={handleDelete}
          className="text-red-600 disabled:opacity-50"
          size="icon"
          variant="ghost"
        >
          <Trash />
        </Button>
      </div>

      <CreateBatchDialog
        batch={batch}
        open={open}
        setOpen={setOpen}
        mode="edit"
      />
    </>
  );
}
