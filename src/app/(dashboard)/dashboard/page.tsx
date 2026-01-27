import { getDashbaordStats } from "@/app/hooks/get-dashboard-stats";
import { Suspense } from "react";
import DashboardSkeleton from "./_components/dashboard-skeleton";
import DashboardStatistics from "./_components/dashboard-statistics";

export default async function Dashboard() {
  const stats = await getDashbaordStats();

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardStatistics stats={stats} />
    </Suspense>
  );
}
