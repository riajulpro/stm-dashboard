import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import CreateSubscriptionButton from "./_components/create-subscription-button";

// import { DataTable } from "@/components/shared/data-table";

import { db } from "@/lib/prisma";
// import { subscriptionColumns } from "@/data-columns/subscription/subscription";

export default async function SubscriptionPage() {
  const subscription = await db.courseSubscription.findMany({
    include: {
      student: true,
      course: true,
    },
  });

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
            <p className="text-muted-foreground">
              Manage your subscriptions and their information
            </p>
          </div>
          <CreateSubscriptionButton />
        </div>

        {/* Students Table */}
        <Suspense fallback={<Spinner />}>
          {/* <DataTable columns={subscriptionColumns} data={subscription} /> */}
        </Suspense>
      </div>
    </div>
  );
}
