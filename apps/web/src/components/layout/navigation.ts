import {
  ClipboardCheck,
  Gauge,
  History,
  Inbox,
  PackageSearch,
  Search,
  Settings,
  ShieldCheck,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";

export type ShellNavigationItem = {
  readonly href: string;
  readonly icon: LucideIcon;
  readonly label: string;
  readonly prototypeState?: string;
};

export const shellNavigationItems: readonly ShellNavigationItem[] = [
  { href: "/dashboard", icon: Gauge, label: "Dashboard" },
  { href: "/imports", icon: UploadCloud, label: "Imports", prototypeState: "Prototype empty" },
  { href: "/products", icon: PackageSearch, label: "Products", prototypeState: "Prototype empty" },
  { href: "/search", icon: Search, label: "Search", prototypeState: "Prototype empty" },
  { href: "/review", icon: ClipboardCheck, label: "Review Queue", prototypeState: "Prototype empty" },
  { href: "/evaluation", icon: ShieldCheck, label: "Evaluation", prototypeState: "Prototype empty" },
  { href: "/audit", icon: History, label: "Audit", prototypeState: "Prototype empty" },
  { href: "/settings", icon: Settings, label: "Settings", prototypeState: "Prototype empty" },
];

export const shellSecondaryItems: readonly ShellNavigationItem[] = [
  { href: "/imports", icon: Inbox, label: "Import inbox", prototypeState: "Queued for M3" },
];
