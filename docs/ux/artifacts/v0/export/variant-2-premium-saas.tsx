import { ArrowUpRight, ArrowDownRight, Plus, ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
import { PremiumShell } from "@/components/premium/premium-shell"
import { StatusBadge } from "@/components/status-badge"
import {
  metrics,
  recentImports,
  reviewCases,
  evaluation,
  auditEvents,
  type ImportStatus,
  type ReviewSeverity,
} from "@/lib/data"
import { cn } from "@/lib/utils"

const spark: Record<string, number[]> = {
  products: [38, 41, 40, 44, 46, 45, 48],
  suppliers: [70, 74, 72, 80, 85, 88, 92],
  review: [22, 25, 28, 26, 30, 33, 37],
  search: [60, 62, 66, 70, 74, 82, 84],
}

const importStatus: Record<ImportStatus, { tone: "success" | "processing" | "warning" | "danger"; label: string }> = {
  completed: { tone: "success", label: "Completed" },
  processing: { tone: "processing", label: "Processing" },
  needs_review: { tone: "warning", label: "Needs review" },
  failed: { tone: "danger", label: "Failed" },
}

const sevTone: Record<ReviewSeverity, "danger" | "warning" | "neutral"> = {
  high: "danger",
  medium: "warning",
  low: "neutral",
}

function Sparkbars({ data, tone }: { data: number[]; tone: "positive" | "negative" | "neutral" }) {
  const max = Math.max(...data)
  return (
    <div className="flex h-9 items-end gap-1" aria-hidden>
      {data.map((v, i) => (
        <div
          key={i}
          style={{ height: `${(v / max) * 100}%` }}
          className={cn(
            "w-full rounded-sm",
            tone === "positive" && "bg-success/25",
            tone === "negative" && "bg-destructive/25",
            tone === "neutral" && "bg-muted-foreground/20",
            i === data.length - 1 && tone === "positive" && "bg-success",
            i === data.length - 1 && tone === "negative" && "bg-destructive",
            i === data.length - 1 && tone === "neutral" && "bg-muted-foreground",
          )}
        />
      ))}
    </div>
  )
}

export default function PremiumPage() {
  return (
    <PremiumShell>
      <div className="mx-auto w-full max-w-6xl px-8 py-10">
        {/* Hero header */}
        <div className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <Sparkles className="size-3.5" />
                Live workspace
              </span>
              <span className="text-xs text-muted-foreground">Updated 2 minutes ago</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance">Commerce Operations</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground text-pretty">
              Monitor catalog ingestion, normalization quality, search relevance, and governance across every
              supplier feed in one refined workspace.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-border bg-card p-1 text-xs font-medium">
              {["24h", "7d", "30d"].map((t, i) => (
                <button
                  key={t}
                  className={cn(
                    "rounded-md px-3 py-1.5 transition-colors",
                    i === 1 ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
              <Plus className="size-4" />
              New import
            </button>
          </div>
        </div>

        {/* Metric cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => {
            const Trend = m.trend === "down" ? ArrowDownRight : ArrowUpRight
            return (
              <div
                key={m.id}
                className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <p className="text-sm font-medium text-muted-foreground">{m.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{m.value}</p>
                <div className="mt-4">
                  <Sparkbars data={spark[m.id]} tone={m.deltaTone} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{m.sub}</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums",
                      m.deltaTone === "positive" && "text-success",
                      m.deltaTone === "negative" && "text-destructive",
                      m.deltaTone === "neutral" && "text-muted-foreground",
                    )}
                  >
                    <Trend className="size-3.5" />
                    {m.delta}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Body grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Imports */}
            <section className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between px-6 py-5">
                <div>
                  <h2 className="text-base font-semibold">Recent imports</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">Across all active supplier feeds</p>
                </div>
                <a href="#" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  View all
                  <ArrowRight className="size-4" />
                </a>
              </div>
              <div className="divide-y divide-border border-t border-border">
                {recentImports.map((row) => {
                  const s = importStatus[row.status]
                  return (
                    <div key={row.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/40">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{row.source}</span>
                          <span className="font-mono text-xs text-muted-foreground">{row.id}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {row.supplier} · {row.startedAt}
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <p className="text-sm font-medium tabular-nums">{row.records.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{row.mapped}% mapped</p>
                      </div>
                      <StatusBadge tone={s.tone} dot={row.status === "processing"}>
                        {s.label}
                      </StatusBadge>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Evaluation */}
            <section className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between px-6 py-5">
                <div>
                  <h2 className="text-base font-semibold">Search quality evaluation</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {evaluation.runId} · {evaluation.finishedAt}
                  </p>
                </div>
                <StatusBadge tone="success">Passed gate</StatusBadge>
              </div>
              <div className="grid grid-cols-1 gap-5 border-t border-border px-6 py-5 sm:grid-cols-2">
                {evaluation.metrics.map((m) => {
                  const pct = m.label === "Zero-result rate" ? 96 : Math.round(Number.parseFloat(m.value) * 100)
                  return (
                    <div key={m.label}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-muted-foreground">{m.label}</span>
                        <span className="flex items-baseline gap-1.5">
                          <span className="text-lg font-semibold tabular-nums">{m.value}</span>
                          <span
                            className={cn(
                              "text-xs font-medium tabular-nums",
                              m.tone === "positive" && "text-success",
                              m.tone === "negative" && "text-destructive",
                              m.tone === "neutral" && "text-muted-foreground",
                            )}
                          >
                            {m.delta}
                          </span>
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", m.tone === "negative" ? "bg-destructive" : "bg-primary")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-2 border-t border-border px-6 py-4 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-success" />
                <span>
                  Benchmarked on <span className="font-medium text-foreground">{evaluation.dataset}</span> ·{" "}
                  <span className="font-mono text-xs">{evaluation.model}</span>
                </span>
              </div>
            </section>
          </div>

          {/* Side column */}
          <div className="flex flex-col gap-6">
            <section className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold">Review queue</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">37 open · by severity</p>
                </div>
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                  Open
                </a>
              </div>
              <div className="divide-y divide-border border-t border-border">
                {reviewCases.slice(0, 4).map((c) => (
                  <div key={c.id} className="px-5 py-4 transition-colors hover:bg-muted/40">
                    <div className="flex items-center gap-2">
                      <StatusBadge tone={sevTone[c.severity]}>{c.severity}</StatusBadge>
                      <span className="text-xs font-medium text-muted-foreground">{c.type}</span>
                    </div>
                    <p className="mt-2 line-clamp-1 text-sm font-medium">{c.product}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{c.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card">
              <div className="px-5 py-4">
                <h2 className="text-base font-semibold">Activity</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Recent audit events</p>
              </div>
              <ol className="border-t border-border px-5 py-4">
                {auditEvents.slice(0, 4).map((e, i, arr) => (
                  <li key={e.id} className="relative flex gap-3 pb-5 last:pb-0">
                    {i < arr.length - 1 && (
                      <span className="absolute left-[5px] top-4 h-full w-px bg-border" aria-hidden />
                    )}
                    <span className="mt-1.5 size-2.5 shrink-0 rounded-full border-2 border-primary bg-card" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{e.actor.split("@")[0]}</span>{" "}
                        <span className="text-muted-foreground">{e.action}</span>
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{e.target}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground/70">{e.time}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </div>
    </PremiumShell>
  )
}
