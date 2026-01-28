import DashboardNavbar from "./_components/dashboard-navbar";
import DashboardSidebar from "./_components/dashboard-sidebar";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <section className="h-full flex flex-col">
      <header className="h-20 md:pl-56 fixed inset-x-0 top-0 z-10">
        <DashboardNavbar />
      </header>
      <aside className="hidden md:flex flex-col inset-y-0 fixed h-full w-56">
        <DashboardSidebar />
      </aside>
      <main className="md:pl-56 pt-20">{children}</main>
    </section>
  );
}
