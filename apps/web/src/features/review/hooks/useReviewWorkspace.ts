"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useCurrentSession } from "@/lib/auth";

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
  const { session } = useCurrentSession();
  const [interaction, setInteraction] = useState<ReviewInteractionState | null>(null);

  const state = useMemo<ReviewFeatureState>(() => toReviewFeatureState(loadReviewWorkspace(session)), [session]);

  useEffect(() => {
    if (state.kind !== "ready" && state.kind !== "partial_success") {
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
        if (!current || (state.kind !== "ready" && state.kind !== "partial_success")) {
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
