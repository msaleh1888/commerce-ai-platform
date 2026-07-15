import { ArrowUpRight, ArrowDownRight, Plus, ChevronRight } from "lucide-react"
import { DenseShell } from "@/components/dense/dense-shell"
import { StatusBadge } from "@/components/status-badge"
import {
  metrics,
  recentImports,
  reviewCases,
  evaluation,
  auditEvents,
  feedHealth,
  pipeline,
  type ImportStatus,
  type ReviewSeverity,
  type FeedHealth,
} from "@/lib/data"
import { cn } from "@/lib/utils"

const importStatus: Record<ImportStatus, { tone: "success" | "processing" | "warning" | "danger"; label: string }> = {
  completed: { tone: "success", label: "Done" },
  processing: { tone: "processing", label: "Running" },
  needs_review: { tone: "warning", label: "Review" },
  failed: { tone: "danger", label: "Failed" },
}

const sevTone: Record<ReviewSeverity, "danger" | "warning" | "neutral"> = {
  high: "danger",
  medium: "warning",
  low: "neutral",
}

const feedTone: Record<FeedHealth["status"], "success" | "warning" | "danger"> = {
  healthy: "success",
  degraded: "warning",
  down: "danger",
}

function Panel({
  title,
  meta,
  children,
  className,
}: {
  title: string
  meta?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("flex min-w-0 flex-col rounded-md border border-border bg-card", className)}>
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-foreground">{title}</h2>
        {meta && <span className="text-[11px] text-muted-foreground tabular-nums">{meta}</span>}
      </div>
      {children}
    </section>
  )
}

export default function DensePage() {
  return (
    <DenseShell>
      <div className="p-3">
        {/* Title row */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight">Commerce Operations Console</h1>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              LIVE · US-East
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex h-7 items-center gap-1 rounded border border-border bg-background px-2 text-xs font-medium text-foreground hover:bg-muted">
              Export
            </button>
            <button className="inline-flex h-7 items-center gap-1 rounded bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="size-3.5" />
              New import
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="mb-3 grid grid-cols-2 divide-x divide-border rounded-md border border-border bg-card md:grid-cols-4">
          {metrics.map((m) => {
            const Trend = m.trend === "down" ? ArrowDownRight : ArrowUpRight
            return (
              <div key={m.id} className="px-3 py-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-semibold tabular-nums">{m.value}</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums",
                      m.deltaTone === "positive" && "text-success",
                      m.deltaTone === "negative" && "text-destructive",
                      m.deltaTone === "neutral" && "text-muted-foreground",
                    )}
                  >
                    <Trend className="size-3" />
                    {m.delta}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{m.sub}</p>
              </div>
            )
          })}
        </div>

        {/* Pipeline funnel */}
        <Panel title="Ingestion pipeline" meta="today · 5 feeds" className="mb-3">
          <div className="grid grid-cols-2 divide-y divide-border sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-5 lg:divide-x">
            {pipeline.map((s, i) => (
              <div key={s.stage} className="flex items-center gap-2 px-3 py-2">
                <span className="flex size-5 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground tabular-nums">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-semibold tabular-nums">{s.count}</span>
                    <span className="text-[11px] font-medium text-foreground">{s.stage}</span>
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">{s.detail}</p>
                </div>
                {i < pipeline.length - 1 && (
                  <ChevronRight className="ml-auto hidden size-3.5 shrink-0 text-muted-foreground lg:block" />
                )}
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          {/* Left column: imports + feeds */}
          <div className="flex flex-col gap-3 xl:col-span-2">
            <Panel title="Recent imports" meta="last 24h">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] text-muted-foreground">
                      <th className="px-3 py-1.5 font-medium">ID</th>
                      <th className="px-3 py-1.5 font-medium">Source</th>
                      <th className="px-3 py-1.5 font-medium">Supplier</th>
                      <th className="px-3 py-1.5 text-right font-medium">Records</th>
                      <th className="px-3 py-1.5 text-right font-medium">Mapped</th>
                      <th className="px-3 py-1.5 font-medium">Status</th>
                      <th className="px-3 py-1.5 text-right font-medium">Dur.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentImports.map((row) => {
                      const s = importStatus[row.status]
                      return (
                        <tr key={row.id} className="border-b border-border/50 last:border-0 hover:bg-muted/40">
                          <td className="px-3 py-1.5 font-mono text-[11px] text-muted-foreground">{row.id}</td>
                          <td className="px-3 py-1.5 font-medium text-foreground">{row.source}</td>
                          <td className="px-3 py-1.5 text-muted-foreground">{row.supplier}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">{row.records.toLocaleString()}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">{row.mapped}%</td>
                          <td className="px-3 py-1.5">
                            <StatusBadge tone={s.tone} dot={row.status === "processing"}>
                              {s.label}
                            </StatusBadge>
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono text-[11px] text-muted-foreground">
                            {row.duration}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel title="Supplier feed health" meta="5 feeds">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] text-muted-foreground">
                      <th className="px-3 py-1.5 font-medium">Supplier</th>
                      <th className="px-3 py-1.5 font-medium">Status</th>
                      <th className="px-3 py-1.5 text-right font-medium">Last sync</th>
                      <th className="px-3 py-1.5 text-right font-medium">Freshness</th>
                      <th className="px-3 py-1.5 text-right font-medium">Mapped</th>
                      <th className="px-3 py-1.5 text-right font-medium">Err rate</th>
                      <th className="px-3 py-1.5 text-right font-medium">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedHealth.map((f) => (
                      <tr key={f.supplier} className="border-b border-border/50 last:border-0 hover:bg-muted/40">
                        <td className="px-3 py-1.5 font-medium text-foreground">{f.supplier}</td>
                        <td className="px-3 py-1.5">
                          <StatusBadge tone={feedTone[f.status]} dot>
                            {f.status}
                          </StatusBadge>
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono text-[11px] text-muted-foreground">
                          {f.lastSync}
                        </td>
                        <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">{f.freshness}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums">{f.mappedPct}%</td>
                        <td
                          className={cn(
                            "px-3 py-1.5 text-right tabular-nums",
                            f.status === "down" ? "font-medium text-destructive" : "text-muted-foreground",
                          )}
                        >
                          {f.errorRate}
                        </td>
                        <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">{f.volume}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>

          {/* Right column: review queue + eval + audit */}
          <div className="flex flex-col gap-3">
            <Panel title="Review queue" meta="37 open · by severity">
              <ul className="divide-y divide-border/50">
                {reviewCases.map((c) => (
                  <li key={c.id} className="flex items-start gap-2 px-3 py-2 hover:bg-muted/40">
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <StatusBadge tone={sevTone[c.severity]}>{c.severity[0].toUpperCase()}</StatusBadge>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-medium text-foreground">{c.product}</span>
                        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{c.id}</span>
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground">{c.detail}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{c.type}</span>
                        <span aria-hidden>·</span>
                        <span className="tabular-nums">{(c.confidence * 100).toFixed(0)}%</span>
                        <span aria-hidden>·</span>
                        <span>{c.age}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Latest evaluation" meta={evaluation.runId}>
              <div className="grid grid-cols-2 divide-x divide-y divide-border">
                {evaluation.metrics.map((m) => (
                  <div key={m.label} className="px-3 py-2">
                    <p className="text-[11px] text-muted-foreground">{m.label}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-semibold tabular-nums">{m.value}</span>
                      <span
                        className={cn(
                          "text-[11px] font-medium tabular-nums",
                          m.tone === "positive" && "text-success",
                          m.tone === "negative" && "text-destructive",
                          m.tone === "neutral" && "text-muted-foreground",
                        )}
                      >
                        {m.delta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground">
                <span className="font-medium text-success">Passed gate</span> · {evaluation.dataset}
              </div>
            </Panel>

            <Panel title="Audit log" meta="live">
              <ul className="divide-y divide-border/50">
                {auditEvents.map((e) => (
                  <li key={e.id} className="flex items-baseline gap-2 px-3 py-1.5">
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground tabular-nums">{e.time}</span>
                    <p className="min-w-0 flex-1 truncate text-[11px]">
                      <span className="font-medium text-foreground">{e.actor.split("@")[0]}</span>{" "}
                      <span className="text-muted-foreground">{e.action}</span>{" "}
                      <span className="text-foreground">{e.target}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </DenseShell>
  )
}
