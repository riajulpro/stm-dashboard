import { UserAvatar } from "@/components/shared/user-avatar";

export default function DashboardNavbar() {
  return (
    <div className="py-3 px-3 md:px-4 border-b bg-slate-50 w-full flex justify-between items-center">
      <div className="ml-auto">
        <UserAvatar />
      </div>
    </div>
  );
}
