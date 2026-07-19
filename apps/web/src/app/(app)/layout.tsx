import type { ReactNode } from "react";

import { AppShell, getShellDemoContext } from "@/components/layout";

export default function AuthenticatedAppLayout({ children }: { children: ReactNode }) {
  const shellContext = getShellDemoContext();

  return (
    <AppShell
      processingIndicator={shellContext.processingIndicator}
      session={shellContext.session}
    >
      {children}
    </AppShell>
  );
}
