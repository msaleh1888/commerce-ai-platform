"use client";

import { useCallback, useEffect, useState } from "react";

import { useCurrentSession } from "@/lib/auth";

import { loadDashboardSummaryForSession } from "../api";
import {
  createDashboardReadyState,
  type DashboardFeatureState,
} from "../schemas/view-model";
import { createDashboardLoadingState } from "../state/fixtures";

export function useDashboardSummary() {
  const { session, sessionMode } = useCurrentSession();
  const [state, setState] = useState<DashboardFeatureState>(() =>
    createDashboardLoadingState(session),
  );

  const load = useCallback(() => {
    let cancelled = false;

    setState(createDashboardLoadingState(session));

    loadDashboardSummaryForSession(session)
      .then((result) => {
        if (cancelled) {
          return;
        }

        if (result.kind === "error") {
          setState({
            kind: "error",
            code: result.code,
            title: "Dashboard data unavailable",
            message: result.message,
          });
          return;
        }

        setState(createDashboardReadyState(result.summary));
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            kind: "error",
            code: "load_failed",
            title: "Dashboard data unavailable",
            message:
              "The dashboard demo adapter could not load this tenant summary. Retry only reloads local dashboard state.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => load(), [load]);

  return { retry: load, sessionMode, state };
}
