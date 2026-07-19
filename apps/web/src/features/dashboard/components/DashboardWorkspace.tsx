"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  Database,
  RefreshCw,
  Rows3,
  SearchCheck,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/components/ui/utils";

import { useDashboardSummary } from "../hooks/useDashboardSummary";
import type {
  DashboardFeatureState,
  DashboardStatusTone,
  DashboardViewModel,
} from "../schemas/view-model";

const metricIcons = [Database, Rows3, ClipboardCheck, SearchCheck] as const;

export function DashboardWorkspace() {
  const { retry, sessionMode, state } = useDashboardSummary();

  return <DashboardContent onRetry={retry} sessionMode={sessionMode} state={state} />;
}

export function DashboardContent({
  onRetry,
  sessionMode,
  state,
}: {
  readonly onRetry: () => void;
  readonly sessionMode: "authenticated" | "demo";
  readonly state: DashboardFeatureState;
}) {
  if (state.kind === "loading") {
    return <DashboardLoading tenantName={state.tenantName} />;
  }

  if (state.kind === "error") {
    return (
      <DashboardFrame context="Tenant-scoped operational summary." sessionMode={sessionMode} tenantName="Unknown tenant">
        <Panel className="max-w-2xl" title={state.title}>
          <div className="flex gap-3">
            <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-status-failed" size={20} />
            <div className="min-w-0">
              <p className="text-sm text-text-secondary">{state.message}</p>
              <p className="mt-2 text-xs text-text-muted">
                Error code: <span className="font-mono">{state.code}</span>
              </p>
              <Button className="mt-4" icon={<RefreshCw size={15} />} onClick={onRetry} size="sm">
                Retry
              </Button>
            </div>
          </div>
        </Panel>
      </DashboardFrame>
    );
  }

  if (state.kind === "permission_denied") {
    return (
      <DashboardFrame context="Tenant-scoped operational summary." sessionMode={sessionMode} tenantName={state.tenantName}>
        <Panel className="max-w-2xl" title="Permission denied">
          <p className="text-sm text-text-secondary">{state.message}</p>
          <p className="mt-2 text-xs text-text-muted">
            Authorization remains server-owned; browser capability data is presentation-only.
          </p>
        </Panel>
      </DashboardFrame>
    );
  }

  if (state.kind === "empty") {
    return (
      <DashboardFrame context="Tenant-scoped operational summary." sessionMode={sessionMode} tenantName={state.tenantName}>
        <Panel className="max-w-2xl" title="No catalog operations yet">
          <p className="text-sm text-text-secondary">{state.message}</p>
          <p className="mt-2 text-xs text-text-muted">
            Import, review, evaluation, and audit workflows are not simulated from empty data.
          </p>
        </Panel>
      </DashboardFrame>
    );
  }

  return <DashboardReady sessionMode={sessionMode} viewModel={state.viewModel} />;
}

function DashboardReady({
  sessionMode,
  viewModel,
}: {
  readonly sessionMode: "authenticated" | "demo";
  readonly viewModel: DashboardViewModel;
}) {
  return (
    <DashboardFrame context="Tenant-scoped operational summary." sessionMode={sessionMode} tenantName={viewModel.tenantName}>
      <MetricGrid viewModel={viewModel} />
      <PipelineOverview viewModel={viewModel} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <RecentImports viewModel={viewModel} />
        <ReviewQueue viewModel={viewModel} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <EvaluationPanel viewModel={viewModel} />
        <AuditPanel viewModel={viewModel} />
      </div>
    </DashboardFrame>
  );
}

function DashboardFrame({
  children,
  context,
  sessionMode,
  tenantName,
}: {
  readonly children: ReactNode;
  readonly context: string;
  readonly sessionMode: "authenticated" | "demo";
  readonly tenantName: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4">
      <div className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-normal text-text-primary">Catalog operations</h1>
            {sessionMode === "demo" && <StatusBadge tone="inactive">Demo data</StatusBadge>}
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">{context}</p>
        </div>
        <div className="rounded-md border border-border bg-surface-subtle px-3 py-2 text-sm">
          <p className="text-xs font-medium uppercase text-text-muted">Active tenant</p>
          <p className="mt-1 font-semibold text-text-primary">{tenantName}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function MetricGrid({ viewModel }: { readonly viewModel: DashboardViewModel }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {viewModel.metrics.map((metric, index) => {
        const Icon = metricIcons[index] ?? Database;

        return (
          <Panel
            className={cn("shadow-none", metric.urgent && "border-status-review bg-status-surface-review/55")}
            key={metric.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-secondary">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-normal tabular-nums text-text-primary">
                  {metric.value}
                </p>
              </div>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-deep">
                <Icon aria-hidden="true" size={18} />
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge tone={metric.tone}>{metric.statusLabel}</StatusBadge>
              {metric.trendLabel && <span className="text-xs text-text-muted">{metric.trendLabel}</span>}
            </div>
            <p className="mt-3 text-xs leading-5 text-text-muted">{metric.sourceContext}</p>
          </Panel>
        );
      })}
    </div>
  );
}

function PipelineOverview({ viewModel }: { readonly viewModel: DashboardViewModel }) {
  return (
    <Panel
      description={
        viewModel.hasPartialSuccess
          ? "Partial success counts are shown beside the affected stages and imports."
          : "Deterministic stage ordering from the dashboard adapter."
      }
      title="Pipeline overview"
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {viewModel.pipelineStages.map((stage, index) => (
          <div
            className={cn(
              "min-w-0 rounded-md border border-border bg-surface-subtle p-3",
              stage.hasException && "border-status-review bg-status-surface-review/40",
              stage.tone === "failed" && "border-status-failed bg-status-surface-failed/35",
            )}
            key={stage.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase text-text-muted">Stage {index + 1}</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">{stage.label}</p>
              </div>
              <StatusBadge tone={stage.tone}>{stage.statusLabel}</StatusBadge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <CountBlock label="Processed" value={stage.processedCount} />
              <CountBlock label="Issues" value={stage.issueCount} />
            </dl>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function RecentImports({ viewModel }: { readonly viewModel: DashboardViewModel }) {
  return (
    <Panel description="Source, supplier, row counts, searchable state, and exception context." title="Recent imports">
      <div className="divide-y divide-border">
        {viewModel.recentImports.map((item) => (
          <article className="py-3 first:pt-0 last:pb-0" key={item.id}>
            <div className="grid gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="break-words text-sm font-semibold text-text-primary">{item.source}</p>
                  <StatusBadge tone={item.tone}>{item.statusLabel}</StatusBadge>
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  {item.supplierName} / <span className="font-mono">{item.id}</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-text-muted sm:grid-cols-4">
                <span>Submitted {item.submittedAt}</span>
                <span>Completed {item.completedAt}</span>
                <span>{item.searchableLabel}</span>
                <span>{item.reviewCandidates} review candidates</span>
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 rounded-md bg-surface-subtle p-3 text-xs sm:grid-cols-5">
              <CountBlock label="Total" value={item.totalRows} />
              <CountBlock label="Accepted" value={item.acceptedRows} />
              <CountBlock label="Normalized" value={item.normalizedRows} />
              <CountBlock label="Rejected" value={item.rejectedRows} />
              <CountBlock label="Review" value={item.reviewCandidates} />
            </dl>
            {item.issueSummary && (
              <p className="mt-2 text-xs leading-5 text-text-secondary">
                <span className="font-semibold">{item.partialSuccess ? "Partial success:" : "Exception:"}</span>{" "}
                {item.issueSummary}
              </p>
            )}
          </article>
        ))}
      </div>
    </Panel>
  );
}

function ReviewQueue({ viewModel }: { readonly viewModel: DashboardViewModel }) {
  const summary = viewModel.reviewSummary;

  return (
    <Panel
      actions={
        <Link
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-border bg-surface-raised px-3 text-sm font-medium text-accent-deep shadow-raised transition-colors hover:bg-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          href="/review"
        >
          Open review queue
          <ArrowRight aria-hidden="true" size={15} />
        </Link>
      }
      className={summary.hasUrgentWork ? "border-status-review bg-status-surface-review/30" : undefined}
      description="Human decision queue summary."
      title="Review queue"
    >
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <SummaryStat label="Open" tone="review" value={summary.open.toLocaleString("en-US")} />
        <SummaryStat label="High risk" tone={summary.hasUrgentWork ? "failed" : "inactive"} value={summary.highRisk.toLocaleString("en-US")} />
        <SummaryStat label="Assigned to me" value={summary.assignedToMe.toLocaleString("en-US")} />
        <SummaryStat label="Oldest age" value={summary.oldestOpenAge} />
      </dl>
      <p className="mt-4 text-xs leading-5 text-text-muted">
        Browser role and capability labels can clarify the UI, but FastAPI remains authoritative for approval and review actions.
      </p>
    </Panel>
  );
}

function EvaluationPanel({ viewModel }: { readonly viewModel: DashboardViewModel }) {
  const evaluation = viewModel.evaluation;

  return (
    <Panel
      description="Deterministic demo evaluation with run and configuration context."
      eyebrow="Demo evaluation"
      title="Latest search evaluation"
    >
      <div className="grid gap-2 text-xs text-text-muted sm:grid-cols-3">
        <EvidenceId label="Manifest" value={evaluation.manifestId} />
        <EvidenceId label="Run" value={evaluation.runId} />
        <EvidenceId label="Configuration" value={evaluation.configurationId} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {evaluation.metrics.map((metric) => (
          <div className="rounded-md border border-border bg-surface-subtle p-3" key={metric.id}>
            <p className="text-xs text-text-muted">{metric.label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{metric.value}</p>
            <p className="mt-1 text-xs text-status-ready">{metric.delta}</p>
            <p className="mt-2 text-xs text-text-muted">{metric.baselineValue}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-text-secondary">{evaluation.baselineComparison}</p>
      <p className="mt-2 rounded-md bg-surface-evidence p-3 text-xs leading-5 text-text-muted">
        {evaluation.demoDataNotice} Evaluated at {evaluation.evaluatedAt}.
      </p>
    </Panel>
  );
}

function AuditPanel({ viewModel }: { readonly viewModel: DashboardViewModel }) {
  return (
    <Panel description="Read-only tenant-scoped demo evidence." title="Recent audit activity">
      <ol className="space-y-3">
        {viewModel.auditEvents.map((event) => (
          <li className="grid gap-2 rounded-md border border-border bg-surface-subtle p-3 text-sm" key={event.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-text-primary">{event.actor}</span>
              <span className="text-xs text-text-muted">{event.occurredAt}</span>
            </div>
            <p className="break-words text-text-secondary">
              {event.action} / <span className="font-mono text-xs">{event.target}</span>
            </p>
            <p className="text-xs leading-5 text-text-muted">{event.metadataSummary}</p>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

function DashboardLoading({ tenantName }: { readonly tenantName: string }) {
  return (
    <DashboardFrame context="Tenant-scoped operational summary." sessionMode="authenticated" tenantName={tenantName}>
      <div aria-live="polite" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Panel className="min-h-36 shadow-none" key={index}>
            <div className="h-4 w-32 rounded bg-surface-subtle" />
            <div className="mt-5 h-7 w-24 rounded bg-surface-subtle" />
            <div className="mt-5 h-4 w-full rounded bg-surface-subtle" />
          </Panel>
        ))}
      </div>
      <Panel className="min-h-40" title="Pipeline overview">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-24 rounded-md bg-surface-subtle" key={index} />
          ))}
        </div>
      </Panel>
      <Panel className="min-h-52" title="Recent imports">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="h-12 rounded-md bg-surface-subtle" key={index} />
          ))}
        </div>
      </Panel>
    </DashboardFrame>
  );
}

function CountBlock({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <dt className="text-text-muted">{label}</dt>
      <dd className="mt-1 font-semibold tabular-nums text-text-primary">{value}</dd>
    </div>
  );
}

function SummaryStat({
  label,
  tone = "inactive",
  value,
}: {
  readonly label: string;
  readonly tone?: DashboardStatusTone;
  readonly value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-surface-subtle p-3">
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-xl font-semibold tabular-nums text-text-primary",
          tone === "failed" && "text-status-failed",
          tone === "review" && "text-status-review",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function EvidenceId({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="min-w-0 rounded-md bg-surface-subtle p-2">
      <p className="font-medium uppercase">{label}</p>
      <p className="mt-1 break-words font-mono text-[11px] text-text-primary">{value}</p>
    </div>
  );
}
