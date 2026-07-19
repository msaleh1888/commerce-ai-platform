import type { ReactNode } from "react";
import { CircleDashed } from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";

type PrototypeEmptyStateProps = {
  description: ReactNode;
  title: string;
};

export function PrototypeEmptyState({ description, title }: PrototypeEmptyStateProps) {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-4">
      <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-text-muted">Operational prototype</p>
          <h1 className="mt-1 text-2xl font-semibold text-text-primary">{title}</h1>
        </div>
        <StatusBadge tone="inactive">No live workflow</StatusBadge>
      </div>
      <Panel
        className="min-w-0 overflow-hidden"
        description="Wired for shell, navigation, and tenant-context review."
        title="Prototype route"
      >
        <EmptyState
          className="min-w-0"
          description={description}
          icon={<CircleDashed aria-hidden="true" size={18} />}
          title={`${title} is intentionally empty in M2-02`}
        />
      </Panel>
    </div>
  );
}
