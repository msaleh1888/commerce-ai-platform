import {
  ClipboardCheck,
  Gauge,
  History,
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
};

export const shellNavigationItems: readonly ShellNavigationItem[] = [
  { href: "/dashboard", icon: Gauge, label: "Dashboard" },
  { href: "/imports", icon: UploadCloud, label: "Imports" },
  { href: "/products", icon: PackageSearch, label: "Products" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/review", icon: ClipboardCheck, label: "Review Queue" },
  { href: "/evaluation", icon: ShieldCheck, label: "Evaluation" },
  { href: "/audit", icon: History, label: "Audit" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export const shellSecondaryItems: readonly ShellNavigationItem[] = [];
