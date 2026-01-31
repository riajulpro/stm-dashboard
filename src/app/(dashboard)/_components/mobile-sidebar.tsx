import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TextAlignJustify } from "lucide-react";
import Logo from "./logo";
import DashboardNavigation from "./dashboard-navigation";

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <TextAlignJustify />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <Logo />
        </SheetHeader>

        <DashboardNavigation />
      </SheetContent>
    </Sheet>
  );
}
