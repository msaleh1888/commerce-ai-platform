"use client";

import { useEffect, useState, type ReactNode } from "react";

import { AppShell, type ShellDemoContext } from "@/components/layout";
import { AuthApiError, getSession } from "@/features/auth/api";
import type { DemoSessionView } from "@/features/demo-data/contracts";

type ShellSessionState =
  | { readonly kind: "loading" }
  | { readonly kind: "authenticated"; readonly session: DemoSessionView }
  | { readonly kind: "demo"; readonly session: DemoSessionView }
  | { readonly kind: "signed_out" };

type AuthenticatedShellBoundaryProps = {
  children: ReactNode;
  demoContext: ShellDemoContext;
};

export function AuthenticatedShellBoundary({ children, demoContext }: AuthenticatedShellBoundaryProps) {
  const [sessionState, setSessionState] = useState<ShellSessionState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    getSession()
      .then((session) => {
        if (!cancelled) {
          setSessionState({ kind: "authenticated", session });
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        if (process.env.NODE_ENV === "development" && !(error instanceof AuthApiError)) {
          setSessionState({ kind: "demo", session: demoContext.session });
          return;
        }

        setSessionState({ kind: "signed_out" });
      });

    return () => {
      cancelled = true;
    };
  }, [demoContext.session]);

  if (sessionState.kind === "loading") {
    return <ShellStatus title="Restoring session" detail="Checking the secure Commerce AI session." />;
  }

  if (sessionState.kind === "signed_out") {
    return <ShellStatus title="Authentication required" detail="Sign in through the Commerce AI API to open tenant operations." />;
  }

  return (
    <AppShell
      processingIndicator={demoContext.processingIndicator}
      session={sessionState.session}
      sessionMode={sessionState.kind}
    >
      {children}
    </AppShell>
  );
}

function ShellStatus({ detail, title }: { detail: string; title: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-application px-6" id="main-workspace">
      <div aria-live="polite" className="w-full max-w-md border border-border bg-surface-raised p-6 shadow-raised">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="mt-2 text-sm text-text-muted">{detail}</p>
      </div>
    </main>
  );
}
