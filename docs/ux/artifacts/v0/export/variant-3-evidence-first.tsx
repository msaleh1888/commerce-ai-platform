"use client"

import { useState } from "react"
import {
  Check,
  X,
  GitMerge,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Clock,
  User,
  Tag,
  Filter,
} from "lucide-react"
import { EvidenceShell } from "@/components/evidence/evidence-shell"
import { StatusBadge } from "@/components/status-badge"
import { reviewCases, type ReviewCase, type ReviewSeverity } from "@/lib/data"
import { cn } from "@/lib/utils"

const sevTone: Record<ReviewSeverity, "danger" | "warning" | "neutral"> = {
  high: "danger",
  medium: "warning",
  low: "neutral",
}

const sevLabel: Record<ReviewSeverity, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
}

const signalTone: Record<"positive" | "negative" | "neutral", string> = {
  positive: "text-success",
  negative: "text-destructive",
  neutral: "text-foreground",
}

export default function EvidencePage() {
  const [selectedId, setSelectedId] = useState<string>(reviewCases[0].id)
  const selected = reviewCases.find((c) => c.id === selectedId) ?? reviewCases[0]

  return (
    <EvidenceShell>
      <div className="flex h-full min-h-0">
        {/* Master queue list */}
        <div className="flex w-[340px] shrink-0 flex-col border-r border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold">Open cases</h1>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground tabular-nums">
                37
              </span>
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground">
              <Filter className="size-3.5" />
              Severity
            </button>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {reviewCases.map((c) => {
              const active = c.id === selectedId
              return (
                <li key={c.id}>
                  <button
                    onClick={() => setSelectedId(c.id)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex w-full flex-col gap-1.5 border-b border-border/60 px-4 py-3 text-left transition-colors",
                      active ? "bg-accent" : "hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge tone={sevTone[c.severity]}>{sevLabel[c.severity]}</StatusBadge>
                      <span className="font-mono text-[10px] text-muted-foreground">{c.id}</span>
                    </div>
                    <span className="line-clamp-2 text-sm font-medium leading-snug text-foreground">{c.product}</span>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{c.type}</span>
                      <span aria-hidden>·</span>
                      <span className="tabular-nums">{(c.confidence * 100).toFixed(0)}% conf.</span>
                      <span aria-hidden>·</span>
                      <span className="tabular-nums">{c.age}</span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Evidence detail panel */}
        <div className="flex min-w-0 flex-1 flex-col bg-muted/30">
          <EvidenceDetail case={selected} />
        </div>
      </div>
    </EvidenceShell>
  )
}

function EvidenceDetail({ case: c }: { case: ReviewCase }) {
  const conflicts = c.evidence.filter((e) => e.conflict).length

  return (
    <>
      {/* Detail header */}
      <div className="shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <StatusBadge tone={sevTone[c.severity]}>{sevLabel[c.severity]} severity</StatusBadge>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                <Tag className="size-3" />
                {c.type}
              </span>
              <span className="font-mono text-xs text-muted-foreground">{c.id}</span>
            </div>
            <h2 className="mt-2 text-lg font-semibold leading-tight text-balance">{c.product}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 font-mono">{c.sku}</span>
              <span className="inline-flex items-center gap-1">
                <User className="size-3" />
                {c.assignee}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" />
                {c.age} in queue
              </span>
              <span>{c.supplier}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <X className="size-4" />
              Reject
            </button>
            {c.type === "Duplicate" ? (
              <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
                <GitMerge className="size-4" />
                Merge records
              </button>
            ) : (
              <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
                <Check className="size-4" />
                Approve
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable evidence body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {/* Recommendation banner */}
          <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">Recommended action</p>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary tabular-nums">
                  {(c.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.recommendation}</p>
            </div>
          </div>

          {/* Signals */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Detection signals
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {c.signals.map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-card p-3">
                  <p className="truncate text-[11px] text-muted-foreground">{s.label}</p>
                  <p className={cn("mt-1 text-sm font-semibold tabular-nums", signalTone[s.tone])}>{s.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Field-by-field evidence diff */}
          <section className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <h3 className="text-sm font-semibold">Field comparison</h3>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium",
                  conflicts > 0 ? "text-destructive" : "text-success",
                )}
              >
                {conflicts > 0 && <AlertTriangle className="size-3.5" />}
                {conflicts > 0 ? `${conflicts} conflicting field${conflicts > 1 ? "s" : ""}` : "No conflicts"}
              </span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Field</th>
                  <th className="px-4 py-2 font-medium">Incoming</th>
                  <th className="w-8 px-1 py-2" aria-hidden />
                  <th className="px-4 py-2 font-medium">Existing (canonical)</th>
                </tr>
              </thead>
              <tbody>
                {c.evidence.map((row) => (
                  <tr
                    key={row.field}
                    className={cn("border-b border-border/60 last:border-0", row.conflict && "bg-destructive/5")}
                  >
                    <td className="px-4 py-2.5 font-medium text-muted-foreground">{row.field}</td>
                    <td
                      className={cn(
                        "px-4 py-2.5 font-mono text-[13px]",
                        row.conflict ? "font-medium text-foreground" : "text-foreground",
                      )}
                    >
                      {row.incoming}
                    </td>
                    <td className="px-1 py-2.5 text-center">
                      <ArrowRight
                        className={cn("mx-auto size-3.5", row.conflict ? "text-destructive" : "text-muted-foreground/40")}
                      />
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[13px] text-muted-foreground">{row.existing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Decision footnote */}
          <p className="text-xs text-muted-foreground">
            Decisions are logged to the audit trail and applied to the canonical catalog immediately. Rejecting keeps
            the incoming record quarantined for re-processing.
          </p>
        </div>
      </div>
    </>
  )
}
