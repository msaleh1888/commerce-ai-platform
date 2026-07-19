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
import { createDashboardAttention } from "../state/attention";

const metricIconById = {
  products: Database,
  supplier_rows: Rows3,
  search_quality: SearchCheck,
} as const;

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
    return <DashboardLoading sessionMode={sessionMode} tenantName={state.tenantName} />;
  }

  if (state.kind === "error") {
    return (
      <DashboardFrame context="Catalog operations could not be loaded." sessionMode={sessionMode} tenantName="Unknown tenant">
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
      <DashboardFrame context="Catalog health and exceptions for this tenant." sessionMode={sessionMode} tenantName={state.tenantName}>
        <Panel className="max-w-2xl" title="Permission denied">
          <p className="text-sm text-text-secondary">{state.message}</p>
        </Panel>
      </DashboardFrame>
    );
  }

  if (state.kind === "empty") {
    return (
      <DashboardFrame context="Catalog health and exceptions for this tenant." sessionMode={sessionMode} tenantName={state.tenantName}>
        <Panel className="max-w-2xl" title="No catalog operations yet">
          <p className="text-sm text-text-secondary">{state.message}</p>
          <p className="mt-2 text-xs text-text-muted">
            Import activity and human review work will appear here when available.
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
    <DashboardFrame
      context="Monitor import health, review work, and search quality."
      priorityLabel={
        viewModel.reviewSummary.hasUrgentWork
          ? `${viewModel.reviewSummary.highRisk} high-risk reviews`
          : undefined
      }
      sessionMode={sessionMode}
      tenantName={viewModel.tenantName}
    >
      <NeedsAttention viewModel={viewModel} />
      <CatalogHealth viewModel={viewModel} />
      <PipelineOverview viewModel={viewModel} />
      <div className="grid gap-4 xl:grid-cols-12">
        <RecentImports className="xl:col-span-8" viewModel={viewModel} />
        <ReviewQueue className="xl:col-span-4 xl:self-start" viewModel={viewModel} />
      </div>
      <section aria-labelledby="evidence-heading" className="space-y-3">
        <div>
          <p className="text-xs font-medium uppercase text-text-muted">Evidence</p>
          <h2 className="mt-1 text-lg font-semibold text-text-primary" id="evidence-heading">
            Quality and operational history
          </h2>
        </div>
        <div className="grid gap-4 xl:grid-cols-12">
          <EvaluationPanel className="xl:col-span-8" viewModel={viewModel} />
          <AuditPanel className="xl:col-span-4 xl:self-start" viewModel={viewModel} />
        </div>
      </section>
    </DashboardFrame>
  );
}

function DashboardFrame({
  children,
  context,
  priorityLabel,
  sessionMode,
  tenantName,
}: {
  readonly children: ReactNode;
  readonly context: string;
  readonly priorityLabel?: string;
  readonly sessionMode: "authenticated" | "demo";
  readonly tenantName: string;
}) {
  return (
    <div className="mx-auto flex min-w-0 w-full max-w-[1440px] flex-col gap-4 overflow-x-hidden">
      <div className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <h1 className="text-2xl font-semibold tracking-normal text-text-primary">Catalog operations</h1>
            {priorityLabel && <StatusBadge className="max-w-full break-words" tone="review">{priorityLabel}</StatusBadge>}
            {sessionMode === "demo" && <StatusBadge className="max-w-full break-words" tone="inactive">Demo data</StatusBadge>}
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">{context}</p>
        </div>
        <div className="hidden rounded-md border border-border bg-surface-subtle px-3 py-2 text-sm md:block">
          <p className="text-xs font-medium uppercase text-text-muted">Active tenant</p>
          <p className="mt-1 font-semibold text-text-primary">{tenantName}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function NeedsAttention({ viewModel }: { readonly viewModel: DashboardViewModel }) {
  const attention = createDashboardAttention(viewModel);

  if (attention === null) {
    return null;
  }

  return (
    <section aria-labelledby="attention-heading" className="w-full overflow-hidden border border-status-review bg-status-surface-review/35 px-4 py-4">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-text-muted">Needs attention</p>
          <h2 className="mt-1 break-words text-lg font-semibold text-text-primary" id="attention-heading">
            Exceptions requiring follow-up
          </h2>
        </div>
        <StatusBadge className="max-w-full break-words" tone="review">{attention.badgeLabel}</StatusBadge>
      </div>
      <div className="mt-4 grid md:grid-cols-2 md:divide-x md:divide-border">
        {attention.items.map((item, index) => (
          <AttentionItem
            className={cn(
              index > 0 && "border-t border-border pt-3 md:border-t-0 md:pl-6 md:pt-0",
              index === 0 && "pb-3 md:pb-0 md:pr-6",
            )}
            detail={item.detail}
            key={item.label}
            label={item.label}
            tone={item.tone}
          />
        ))}
      </div>
    </section>
  );
}

function CatalogHealth({ viewModel }: { readonly viewModel: DashboardViewModel }) {
  const healthMetrics = viewModel.metrics.filter((metric) => !metric.urgent);

  return (
    <section aria-labelledby="health-heading" className="space-y-3">
      <div>
        <p className="text-xs font-medium uppercase text-text-muted">Operations health</p>
        <h2 className="mt-1 text-lg font-semibold text-text-primary" id="health-heading">
          Catalog health summary
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {healthMetrics.map((metric) => {
        const isSupplierRowsMetric = metric.id.includes("supplier_rows");
        const Icon = metricIconById[
          metric.id.includes("supplier_rows")
            ? "supplier_rows"
            : metric.id.includes("search_quality")
              ? "search_quality"
              : "products"
        ];

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
              <StatusBadge tone={metric.tone}>
                {isSupplierRowsMetric ? `Latest import: ${metric.statusLabel.toLowerCase()}` : metric.statusLabel}
              </StatusBadge>
              {metric.trendLabel && !isSupplierRowsMetric && <span className="text-xs text-text-muted">{metric.trendLabel}</span>}
            </div>
            <p className="mt-3 text-xs leading-5 text-text-muted">{metric.sourceContext}</p>
          </Panel>
        );
        })}
      </div>
    </section>
  );
}

function PipelineOverview({ viewModel }: { readonly viewModel: DashboardViewModel }) {
  return (
    <Panel
      description={
        viewModel.hasPartialSuccess
          ? "Partial success counts are shown beside the affected stages and imports."
          : "Current processing stage and exception counts."
      }
      title="Pipeline overview"
    >
      <ol className="grid overflow-hidden rounded-md border border-border md:grid-cols-4">
        {viewModel.pipelineStages.map((stage, index) => (
          <li
            className={cn(
              "min-w-0 bg-surface-subtle p-3",
              index > 0 && "border-t border-border md:border-l md:border-t-0",
              stage.hasException && "bg-status-surface-review/40",
              stage.tone === "failed" && "bg-status-surface-failed/35",
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
          </li>
        ))}
      </ol>
    </Panel>
  );
}

function RecentImports({
  className,
  viewModel,
}: {
  readonly className?: string;
  readonly viewModel: DashboardViewModel;
}) {
  return (
    <Panel
      className={className}
      description="Supplier source, row outcomes, search availability, and exceptions."
      title="Recent imports"
    >
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-border text-xs font-medium uppercase text-text-muted">
            <tr>
              <th className="px-0 py-2 pr-3" scope="col">Source</th>
              <th className="px-3 py-2" scope="col">Status</th>
              <th className="px-3 py-2" scope="col">Accepted / total</th>
              <th className="px-3 py-2" scope="col">Rejected</th>
              <th className="px-3 py-2" scope="col">Review</th>
              <th className="px-3 py-2" scope="col">Search</th>
              <th className="px-3 py-2 pl-3" scope="col">Completed</th>
            </tr>
          </thead>
          <tbody>
            {viewModel.recentImports.map((item) => (
              <ImportTableRows item={item} key={item.id} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-border md:hidden">
        {viewModel.recentImports.map((item) => (
          <article className="py-3 first:pt-0 last:pb-0" key={item.id}>
            <div className="grid gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="break-words text-sm font-semibold text-text-primary">{item.source}</p>
                  <StatusBadge tone={item.tone}>{item.statusLabel}</StatusBadge>
                </div>
                <p className="mt-1 text-sm text-text-muted">
                  {item.supplierName} / <span className="font-mono">{item.id}</span>
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                <ImportMeta label="Submitted" value={item.submittedAt} />
                <ImportMeta label="Completed" value={item.completedAt} />
                <ImportMeta label="Search" value={item.searchableLabel} />
                <ImportMeta label="Review candidates" value={item.reviewCandidates} />
              </dl>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 rounded-md bg-surface-subtle p-3 text-sm sm:grid-cols-5">
              <CountBlock label="Total" value={item.totalRows} />
              <CountBlock label="Accepted" value={item.acceptedRows} />
              <CountBlock label="Normalized" value={item.normalizedRows} />
              <CountBlock label="Rejected" value={item.rejectedRows} />
              <CountBlock label="Review" value={item.reviewCandidates} />
            </dl>
            {item.issueSummary && (
              <p className="mt-2 text-sm leading-5 text-text-secondary">
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

function ImportTableRows({ item }: { readonly item: DashboardViewModel["recentImports"][number] }) {
  return (
    <>
      <tr className="border-b border-border last:border-b-0">
        <td className="min-w-56 py-3 pr-3 align-top">
          <p className="font-semibold text-text-primary">{item.source}</p>
          <p className="mt-1 text-xs text-text-muted">{item.supplierName} / <span className="font-mono">{item.id}</span></p>
        </td>
        <td className="px-3 py-3 align-top"><StatusBadge tone={item.tone}>{item.statusLabel}</StatusBadge></td>
        <td className="px-3 py-3 align-top tabular-nums text-text-primary">{item.acceptedRows} / {item.totalRows}</td>
        <td className="px-3 py-3 align-top tabular-nums text-text-primary">{item.rejectedRows}</td>
        <td className="px-3 py-3 align-top tabular-nums text-text-primary">{item.reviewCandidates}</td>
        <td className="px-3 py-3 align-top text-text-secondary">{item.searchableLabel}</td>
        <td className="px-3 py-3 align-top text-text-secondary">{item.completedAt}</td>
      </tr>
      {item.issueSummary && (
        <tr className="border-b border-border bg-status-surface-review/20">
          <td className="px-0 py-2 text-xs leading-5 text-text-secondary" colSpan={7}>
            <span className="font-semibold">{item.partialSuccess ? "Partial success:" : "Exception:"}</span>{" "}
            {item.issueSummary}
          </td>
        </tr>
      )}
    </>
  );
}

function ReviewQueue({
  className,
  viewModel,
}: {
  readonly className?: string;
  readonly viewModel: DashboardViewModel;
}) {
  const summary = viewModel.reviewSummary;

  return (
    <Panel
      actions={
        <Link
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-border bg-surface-raised px-3 text-sm font-medium text-accent-deep shadow-raised transition-colors hover:bg-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          href="/review"
        >
          View review queue
          <ArrowRight aria-hidden="true" size={15} />
        </Link>
      }
      className={cn(
        summary.hasUrgentWork && "border-status-review bg-status-surface-review/30",
        className,
      )}
      description={
        summary.hasUrgentWork
          ? `${summary.highRisk} high-risk cases need a human decision.`
          : `${summary.open} open cases; none are high risk.`
      }
      title="Review queue"
    >
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <SummaryStat label="Open" tone="review" value={summary.open.toLocaleString("en-US")} />
        <SummaryStat label="High risk" tone={summary.hasUrgentWork ? "failed" : "inactive"} value={summary.highRisk.toLocaleString("en-US")} />
        <SummaryStat label="Assigned to me" value={summary.assignedToMe.toLocaleString("en-US")} />
        <SummaryStat label="Oldest age" value={summary.oldestOpenAge} />
      </dl>
    </Panel>
  );
}

function EvaluationPanel({
  className,
  viewModel,
}: {
  readonly className?: string;
  readonly viewModel: DashboardViewModel;
}) {
  const evaluation = viewModel.evaluation;

  return (
    <Panel
      className={className}
      description="Evaluation run with manifest and configuration context."
      eyebrow="Demo evaluation"
      title="Latest search evaluation"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {evaluation.metrics.map((metric) => (
          <div className="rounded-md border border-border bg-surface-subtle p-3" key={metric.id}>
            <p className="text-xs text-text-muted">{metric.label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{metric.value}</p>
            <p
              className={cn(
                "mt-1 text-xs",
                metric.deltaTone === "failed" ? "text-status-failed" : "text-status-ready",
              )}
            >
              {metric.delta}
            </p>
            <p className="mt-2 text-xs text-text-muted">{metric.baselineValue}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-text-secondary">{evaluation.baselineComparison}</p>
      <div className="mt-4 grid gap-2 text-xs text-text-muted sm:grid-cols-3">
        <EvidenceId label="Manifest" value={evaluation.manifestId} />
        <EvidenceId label="Run" value={evaluation.runId} />
        <EvidenceId label="Configuration" value={evaluation.configurationId} />
      </div>
      <p className="mt-2 rounded-md bg-surface-evidence p-3 text-xs leading-5 text-text-muted">
        {evaluation.demoDataNotice} Evaluated at {evaluation.evaluatedAt}.
      </p>
    </Panel>
  );
}

function AuditPanel({
  className,
  viewModel,
}: {
  readonly className?: string;
  readonly viewModel: DashboardViewModel;
}) {
  return (
    <Panel className={className} description="Read-only operational history for this tenant." title="Recent audit activity">
      <ol className="space-y-3">
        {viewModel.auditEvents.slice(0, 2).map((event) => (
          <li className="grid gap-2 rounded-md border border-border bg-surface-subtle p-3 text-sm" key={event.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-text-primary">{event.actor}</span>
              <span className="text-xs text-text-muted">{event.occurredAt}</span>
            </div>
            <p className="break-words text-text-secondary">
              {event.action} / <span className="font-mono text-xs">{event.target}</span>
            </p>
            <p className="text-sm leading-5 text-text-muted">{event.metadataSummary}</p>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

function DashboardLoading({
  sessionMode,
  tenantName,
}: {
  readonly sessionMode: "authenticated" | "demo";
  readonly tenantName: string;
}) {
  return (
    <DashboardFrame context="Catalog health and exceptions for this tenant." sessionMode={sessionMode} tenantName={tenantName}>
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

function ImportMeta({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase text-text-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm leading-5 text-text-secondary">{value}</dd>
    </div>
  );
}

function AttentionItem({
  className,
  detail,
  label,
  tone,
}: {
  readonly className?: string;
  readonly detail: string;
  readonly label: string;
  readonly tone: DashboardStatusTone;
}) {
  return (
    <div className={cn("min-w-0", className, tone === "failed" && "text-status-failed")}>
      <p className="break-words text-sm font-semibold text-text-primary">{label}</p>
      <p className="mt-1 break-words text-sm leading-5 text-text-secondary">{detail}</p>
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
      <p className="mt-1 break-words font-mono text-xs text-text-primary">{value}</p>
    </div>
  );
}
