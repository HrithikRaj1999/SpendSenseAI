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

        <div className="flex h-dvh flex-1 flex-col min-w-0">
          {/* Add min-w-0 to prevent flex blowout */}
          {/* Scrollable content area */}
          <main className="flex-1 overflow-y-auto relative custom-scrollbar">
            {/* Ensure this div handles the padding properly. 
       The pb-24 on mobile is good to clear the BottomNav. 
    */}
            <div className="px-3 pt-4 pb-24 sm:px-6 md:pb-6">
              <Outlet />
            </div>
          </main>
          {/* BottomNav (mobile only) */}
          <nav className="md:hidden shrink-0 border-t bg-background">
            <BottomNav />
          </nav>
        </div>
      </div>
    </div>
  );
}
