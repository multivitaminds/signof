import type { AgreementStatus, NavItem } from "./types";

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Agreements", href: "/agreements", icon: "file-text", badge: 3 },
  { label: "Settings", href: "/settings/profile", icon: "settings" },
];

export const STATUS_CONFIG: Record<
  AgreementStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  },
  sent: {
    label: "Sent",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  viewed: {
    label: "Viewed",
    className: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  },
  signed: {
    label: "Signed",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  expiring: {
    label: "Expiring",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
  expired: {
    label: "Expired",
    className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
};

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 64;
