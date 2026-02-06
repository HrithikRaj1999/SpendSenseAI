import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { BottomNav } from "@/components/navigation/BottomNav";

export function AppShell() {
  return (
    <div className="h-dvh w-full bg-background text-foreground overflow-hidden">
      <div className="flex h-dvh w-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:block h-dvh shrink-0">
          <AppSidebar />
        </div>

        {/* Right side: content */}
        <div className="flex h-dvh flex-1 flex-col">
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            {/* padding only here */}
            <div className="px-3 pt-4 pb-24 sm:px-6 md:pb-6">
              <Outlet />
            </div>
          </div>

          {/* BottomNav (mobile only) */}
          <div className="md:hidden shrink-0">
            <BottomNav />
          </div>
        </div>
      </div>
    </div>
  );
}
