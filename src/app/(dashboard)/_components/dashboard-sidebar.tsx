import { LayoutDashboard } from "lucide-react";
import DashboardNavigation from "./dashboard-navigation";

export default function DashboardSidebar() {
  return (
    <div className="hidden md:block w-2xs h-screen border-r bg-slate-50 py-3 px-4">
      <div className="font-bold text-md flex items-center gap-2 mb-5">
        <LayoutDashboard /> STM Dashboard
      </div>
      <DashboardNavigation />
    </div>
  );
}
