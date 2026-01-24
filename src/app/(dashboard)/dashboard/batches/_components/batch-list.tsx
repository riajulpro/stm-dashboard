"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

import { Batch } from "@prisma/client";
import { DataTable } from "@/components/shared/data-table";
import { batchesColumns } from "@/data-columns/batches/batches";

export function BatchList({ batches }: { batches: Batch[] }) {
  if (batches.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No batches yet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Create your first batch to start organizing and managing your
            students
          </p>
        </CardContent>
      </Card>
    );
  }

  return <DataTable columns={batchesColumns} data={batches} />;
}
