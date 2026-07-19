import type { ReactNode } from "react";

import { getShellDemoContext } from "@/components/layout";
import { AuthenticatedShellBoundary } from "@/features/auth/components/AuthenticatedShellBoundary";

export default function AuthenticatedAppLayout({ children }: { children: ReactNode }) {
  const shellContext = getShellDemoContext();

  return (
    <AuthenticatedShellBoundary demoContext={shellContext}>{children}</AuthenticatedShellBoundary>
  );
}
