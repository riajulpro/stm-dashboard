"use client";

import {
  ChartColumnStacked,
  LucideIcon,
  Users,
  GraduationCap,
  Calendar,
  CheckCircle,
  BookOpen,
  ChartAreaIcon,
  DollarSign,
  IdCard,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationLinks: { name: string; path: string; icon: LucideIcon }[] = [
  { name: "Statistics", path: "/dashboard", icon: ChartColumnStacked },
  { name: "Batches", path: "/dashboard/batches", icon: IdCard },
  { name: "Students", path: "/dashboard/students", icon: Users },
  { name: "Courses", path: "/dashboard/courses", icon: GraduationCap },
  { name: "Routines", path: "/dashboard/routines", icon: Calendar },
  { name: "Attendance", path: "/dashboard/attendance", icon: CheckCircle },
  { name: "Results", path: "/dashboard/results", icon: BookOpen },
  { name: "Subscriptions", path: "/dashboard/subscriptions", icon: DollarSign },
  { name: "Feedbacks", path: "/dashboard/feedbacks", icon: ChartAreaIcon },
];

const DashboardNavigation = () => {
  const currentPathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPathname === "/dashboard";
    }

    return currentPathname === path || currentPathname.startsWith(path + "/");
  };

  return (
    <div className="flex flex-col gap-1">
      {navigationLinks.map(({ path, name, icon: Icon }) => (
        <Link href={path} key={path}>
          <Button
            variant="ghost"
            className={cn(
              "w-full flex justify-start",
              isActive(path) && "bg-slate-200 text-sky-700 font-semibold",
            )}
          >
            <Icon size={22} /> {name}
          </Button>
        </Link>
      ))}
    </div>
  );
};

export default DashboardNavigation;
