"use client";

import { Search, Bell, Menu } from "lucide-react";
import { useSidebar } from "@/hooks/use-sidebar";
import Avatar from "@/components/ui/avatar";
import { currentUser } from "@/lib/mock-data";

export default function TopBar() {
  const { isMobile, toggle } = useSidebar();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-surface px-4 md:px-6">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={toggle}
            className="p-1.5 rounded-[var(--radius-sm)] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-[var(--radius-sm)] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Search className="h-[18px] w-[18px]" />
        </button>
        <button className="relative p-2 rounded-[var(--radius-sm)] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
        </button>
        <div className="ml-2 hidden sm:block">
          <Avatar name={currentUser.name} size="sm" />
        </div>
      </div>
    </header>
  );
}
