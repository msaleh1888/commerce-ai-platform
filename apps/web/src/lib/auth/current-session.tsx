"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { CurrentSessionView } from "./session-contract";

export type CurrentSessionMode = "authenticated" | "demo";

export type CurrentSessionContextValue = {
  readonly session: CurrentSessionView;
  readonly sessionMode: CurrentSessionMode;
};

const CurrentSessionContext = createContext<CurrentSessionContextValue | null>(null);

export function CurrentSessionProvider({
  children,
  session,
  sessionMode,
}: CurrentSessionContextValue & { readonly children: ReactNode }) {
  return (
    <CurrentSessionContext.Provider value={{ session, sessionMode }}>
      {children}
    </CurrentSessionContext.Provider>
  );
}

export function useCurrentSession(): CurrentSessionContextValue {
  const value = useContext(CurrentSessionContext);

  if (value === null) {
    throw new Error("useCurrentSession must be used within CurrentSessionProvider.");
  }

  return value;
}
