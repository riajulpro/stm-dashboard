import DashboardNavigation from "./dashboard-navigation";
import Logo from "./logo";

export default function DashboardSidebar() {
  return (
    <div className="overflow-y-auto h-full border-r bg-slate-50">
      <Logo />
      <DashboardNavigation />
    </div>
  );
}
