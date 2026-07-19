"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, UserCircle } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Drawer } from "@/components/ui/Drawer";
import { IconButton } from "@/components/ui/IconButton";
import { StatusBadge } from "@/components/ui/StatusBadge";

import type { ShellProcessingIndicator, ShellRole, ShellSessionView } from "./demo-session-adapter";
import { shellNavigationItems, shellSecondaryItems, type ShellNavigationItem } from "./navigation";

type AppShellProps = {
  children: ReactNode;
  processingIndicator: ShellProcessingIndicator;
  session: ShellSessionView;
  sessionMode: "authenticated" | "demo";
};

const roleLabel: Record<ShellRole, string> = {
  administrator: "Administrator",
  catalog_manager: "Catalog Manager",
  merchandiser: "Merchandiser",
  ai_engineer: "AI Engineer",
  viewer: "Viewer",
};

const indicatorTone: Record<ShellProcessingIndicator["status"], "processing" | "ready" | "review" | "failed" | "inactive"> = {
  failed: "failed",
  inactive: "inactive",
  processing: "processing",
  ready: "ready",
  review_required: "review",
  partial_success: "review",
};

export function AppShell({ children, processingIndicator, session, sessionMode }: AppShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface-application text-text-primary">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-surface-raised focus:px-3 focus:py-2 focus:text-sm focus:shadow-dialog"
        href="#main-workspace"
      >
        Skip to workspace
      </a>
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-border bg-surface-sidebar lg:block">
          <ShellSidebar activePath={pathname} session={session} />
        </aside>
        <div className="min-w-0 overflow-x-hidden">
          <ShellTopBar
            onOpenMobileNav={() => setMobileNavOpen(true)}
            processingIndicator={processingIndicator}
            session={session}
            sessionMode={sessionMode}
          />
          <main className="min-w-0 overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8" id="main-workspace" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
      <Drawer
        description="Primary app navigation for the authenticated prototype shell."
        onClose={() => setMobileNavOpen(false)}
        open={mobileNavOpen}
        side="left"
        title="Navigation"
      >
        <ShellSidebar activePath={pathname} compact onNavigate={() => setMobileNavOpen(false)} session={session} />
      </Drawer>
    </div>
  );
}

function ShellTopBar({
  onOpenMobileNav,
  processingIndicator,
  session,
  sessionMode,
}: {
  onOpenMobileNav: () => void;
  processingIndicator: ShellProcessingIndicator;
  session: ShellSessionView;
  sessionMode: "authenticated" | "demo";
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface-raised/95 backdrop-blur">
      <div className="flex min-h-14 min-w-0 items-center gap-3 px-4 sm:min-h-16 sm:px-6 lg:px-8">
        <IconButton
          aria-label="Open navigation"
          className="lg:hidden"
          icon={<Menu size={17} />}
          onClick={onOpenMobileNav}
          variant="ghost"
        />
        <div className="min-w-0 sm:hidden">
          <p className="truncate text-sm font-semibold text-text-primary">{session.activeTenant.name}</p>
          <p className="truncate text-xs text-text-muted">{roleLabel[session.role]}</p>
        </div>
        <div className="ml-auto hidden items-center gap-2 xl:flex">
          <StatusBadge tone={indicatorTone[processingIndicator.status]}>{processingIndicator.label}</StatusBadge>
          {sessionMode === "demo" && <StatusBadge tone="inactive">Demo session preview</StatusBadge>}
          <span className="max-w-48 truncate text-xs text-text-muted">{processingIndicator.detail}</span>
        </div>
        <div className="hidden min-w-0 max-w-56 border-l border-border pl-3 sm:block">
          <p className="truncate text-sm font-semibold text-text-primary">{session.activeTenant.name}</p>
          <p className="truncate text-xs text-text-muted">{roleLabel[session.role]}</p>
        </div>
        <span className="hidden size-9 shrink-0 items-center justify-center text-text-secondary sm:inline-flex" title={session.actor.name}>
          <UserCircle aria-hidden="true" size={18} />
        </span>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-2 border-t border-border px-4 py-2 xl:hidden">
        <StatusBadge className="shrink-0" tone={indicatorTone[processingIndicator.status]}>
          {processingIndicator.label}
        </StatusBadge>
        {sessionMode === "demo" && <StatusBadge className="shrink-0" tone="inactive">Demo session preview</StatusBadge>}
        <span className="hidden min-w-0 max-w-full truncate text-xs text-text-muted sm:block">
          {processingIndicator.detail}
        </span>
      </div>
    </header>
  );
}

function ShellSidebar({
  activePath,
  compact = false,
  onNavigate,
  session,
}: {
  activePath: string;
  compact?: boolean;
  onNavigate?: () => void;
  session: ShellSessionView;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-4 py-4">
        <p className="text-sm font-semibold text-text-primary">Commerce AI</p>
        <p className="mt-1 text-xs text-text-muted">Tenant-scoped operations shell</p>
      </div>
      <nav aria-label="Primary" className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {shellNavigationItems.map((item) => (
          <NavigationLink activePath={activePath} item={item} key={item.href} onNavigate={onNavigate} />
        ))}
      </nav>
      {!compact && shellSecondaryItems.length > 0 && (
        <div className="border-t border-border px-3 py-3">
          {shellSecondaryItems.map((item) => (
            <NavigationLink activePath={activePath} item={item} key={item.href} onNavigate={onNavigate} />
          ))}
        </div>
      )}
      <div className="border-t border-border px-4 py-4">
        <p className="truncate text-xs font-medium uppercase text-text-muted">Signed in</p>
        <p className="mt-1 truncate text-sm font-semibold text-text-primary">{session.actor.name}</p>
        <p className="truncate text-xs text-text-muted">{session.actor.email}</p>
      </div>
    </div>
  );
}

function NavigationLink({
  activePath,
  item,
  onNavigate,
}: {
  activePath: string;
  item: ShellNavigationItem;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const isActive = activePath === item.href || activePath.startsWith(`${item.href}/`);

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={[
        "flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-surface-selected text-accent-deep"
          : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
      ].join(" ")}
      href={item.href}
      onClick={onNavigate}
    >
      <Icon aria-hidden="true" size={17} />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </Link>
  );
}
