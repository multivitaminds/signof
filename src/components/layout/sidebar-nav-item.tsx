"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  "file-text": FileText,
  settings: Settings,
};

interface SidebarNavItemProps {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export default function SidebarNavItem({ label, href, icon, badge }: SidebarNavItemProps) {
  const pathname = usePathname();
  const { collapsed, isMobile, mobileOpen } = useSidebar();
  const Icon = iconMap[icon] || Home;
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
  const showLabel = isMobile ? mobileOpen : !collapsed;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent-light text-accent"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
        !showLabel && "justify-center px-0"
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {showLabel && (
        <>
          <span className="flex-1">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground px-1.5">
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
