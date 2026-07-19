"use client";

import { useCallback, useEffect, useState } from "react";

import { useCurrentSession } from "@/lib/auth";

import { loadDashboardSummaryForSession } from "../api";
import type { DashboardFeatureState } from "../schemas/view-model";
import {
  createDashboardLoadFailedState,
  createDashboardStateFromAdapterResult,
} from "../state/dashboard-state";
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

        setState(createDashboardStateFromAdapterResult(result));
      })
      .catch(() => {
        if (!cancelled) {
          setState(createDashboardLoadFailedState());
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => load(), [load]);

  return { retry: load, sessionMode, state };
}
