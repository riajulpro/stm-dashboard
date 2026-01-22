import DashboardNavbar from "./_components/dashboard-navbar";
import DashboardSidebar from "./_components/dashboard-sidebar";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="md:flex-1 w-full">
        <DashboardNavbar />

        {children}
      </div>
    </div>
  );
}
