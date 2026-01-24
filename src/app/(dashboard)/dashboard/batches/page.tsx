import { db } from "@/lib/prisma";
import { BatchList } from "./_components/batch-list";
import BatchesHeader from "./_components/header";
import { auth } from "@/lib/auth";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default async function BatchesPage() {
  const session = await auth();

  const batches = await db.batch.findMany({
    where: {
      teacherId: session?.user.id,
    },
    include: {
      _count: {
        select: {
          students: true,
          routines: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col gap-6">
        <BatchesHeader />

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <BatchList batches={batches} />
        </Suspense>
      </div>
    </div>
  );
}
