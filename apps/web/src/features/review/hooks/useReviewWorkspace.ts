"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthApiError, getSession } from "@/features/auth/api";
import { getDemoDashboardSummary } from "@/features/demo-data/adapters/dashboard";
import type { DemoSessionView } from "@/features/demo-data/contracts";

import { loadReviewWorkspace } from "../api/review";
import type { ReviewDecision, ReviewFeatureState, ReviewInteractionState } from "../schemas/view-model";
import {
  cancelReviewDecision,
  confirmReviewDecision,
  createInitialInteractionState,
  openReviewDecision,
  selectReviewCase,
  toReviewFeatureState,
} from "../state/review-state";

export interface UseReviewWorkspaceResult {
  readonly state: ReviewFeatureState;
  readonly interaction: ReviewInteractionState | null;
  readonly onSelectCase: (caseId: string) => void;
  readonly onOpenDecision: (decision: ReviewDecision) => void;
  readonly onCancelDecision: () => void;
  readonly onConfirmDecision: () => void;
}

export function useReviewWorkspace(): UseReviewWorkspaceResult {
  const sessionState = useCurrentSession();
  const [interaction, setInteraction] = useState<ReviewInteractionState | null>(null);

  const state = useMemo<ReviewFeatureState>(() => {
    if (sessionState.kind === "loading") {
      return { kind: "loading" };
    }

    if (sessionState.kind === "error") {
      return {
        code: "load_failed",
        kind: "error",
        message: sessionState.message,
        title: "Review data failed to load",
      };
    }

    return toReviewFeatureState(loadReviewWorkspace(sessionState.session));
  }, [sessionState]);

  useEffect(() => {
    if (state.kind !== "ready") {
      setInteraction(null);
      return;
    }

    setInteraction((current) => {
      if (current && state.workspace.casesById[current.selectedCaseId]) {
        return current;
      }

      return createInitialInteractionState(state.workspace.initialSelectedCaseId);
    });
  }, [state]);

  const onSelectCase = useCallback((caseId: string) => {
    setInteraction((current) => (current ? selectReviewCase(current, caseId) : current));
  }, []);

  const onOpenDecision = useCallback(
    (decision: ReviewDecision) => {
      setInteraction((current) => {
        if (!current || state.kind !== "ready") {
          return current;
        }

        return openReviewDecision(current, state.workspace, decision);
      });
    },
    [state],
  );

  const onCancelDecision = useCallback(() => {
    setInteraction((current) => (current ? cancelReviewDecision(current) : current));
  }, []);

  const onConfirmDecision = useCallback(() => {
    setInteraction((current) => (current ? confirmReviewDecision(current) : current));
  }, []);

  return {
    interaction,
    onCancelDecision,
    onConfirmDecision,
    onOpenDecision,
    onSelectCase,
    state,
  };
}

type CurrentSessionState =
  | { readonly kind: "loading" }
  | { readonly kind: "ready"; readonly session: DemoSessionView }
  | { readonly kind: "error"; readonly message: string };

function useCurrentSession(): CurrentSessionState {
  const [sessionState, setSessionState] = useState<CurrentSessionState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    getSession()
      .then((session) => {
        if (!cancelled) {
          setSessionState({ kind: "ready", session });
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        if (process.env.NODE_ENV === "development" && !(error instanceof AuthApiError)) {
          setSessionState({
            kind: "ready",
            session: getDemoDashboardSummary("northstar-retail").session,
          });
          return;
        }

        setSessionState({
          kind: "error",
          message: "A signed-in session is required before duplicate-review data can load.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return sessionState;
}
