"use client";

import { PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { NAV_ITEMS } from "@/lib/constants";
import { currentUser } from "@/lib/mock-data";
import Avatar from "@/components/ui/avatar";
import SidebarNavItem from "./sidebar-nav-item";

export default function Sidebar() {
  const { collapsed, toggle, isMobile, mobileOpen, setMobileOpen } = useSidebar();
  const showFull = isMobile ? mobileOpen : !collapsed;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "flex flex-col border-r border-sidebar-border bg-sidebar-bg transition-all duration-200",
          isMobile
            ? cn(
                "fixed inset-y-0 left-0 z-50 w-[260px]",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
              )
            : cn(
                "sticky top-0 h-screen shrink-0",
                collapsed ? "w-16" : "w-[260px]"
              )
        )}
      >
        {/* Logo + collapse */}
        <div className={cn("flex items-center border-b h-14 px-4", !showFull && "justify-center px-2")}>
          {showFull ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Sign<span className="text-accent">Of</span>
              </span>
              <button
                onClick={toggle}
                className="p-1.5 rounded-[var(--radius-sm)] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={toggle}
              className="p-1.5 rounded-[var(--radius-sm)] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <SidebarNavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* User section */}
        <div className={cn("border-t px-3 py-3", !showFull && "flex justify-center px-2")}>
          <div className={cn("flex items-center gap-3", !showFull && "justify-center")}>
            <Avatar name={currentUser.name} size="sm" />
            {showFull && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
