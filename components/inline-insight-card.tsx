"use client"

import * as React from "react"
import type { Insight } from "@native/types"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type InsightCardProps = {
  insight: Insight
}

const toneStyles: Record<Insight["type"], { badge: string; confidence: string }> = {
  decision: { badge: "bg-[var(--color-accent)]/20 border-[var(--color-accent)]/40 text-[var(--color-accent)]", confidence: "text-[var(--color-fg-secondary)]" },
  risk: { badge: "bg-[var(--color-error)]/15 border-[var(--color-error)]/40 text-[var(--color-error)]", confidence: "text-[var(--color-error)]/80" },
  blocker: { badge: "bg-[var(--color-error)]/15 border-[var(--color-error)]/40 text-[var(--color-error)]", confidence: "text-[var(--color-error)]/80" },
  trend: { badge: "bg-[var(--color-success)]/15 border-[var(--color-success)]/40 text-[var(--color-success)]", confidence: "text-[var(--color-success)]/80" },
  summary: { badge: "bg-[var(--color-fg-tertiary)]/10 border-[var(--color-border-subtle)] text-[var(--color-fg-secondary)]", confidence: "text-[var(--color-fg-secondary)]" },
}

export default function InlineInsightCard({ insight }: InsightCardProps) {
  const styles = toneStyles[insight.type]

  return (
    <div className="relative rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]/90 backdrop-blur-xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border", styles.badge)}>
            {insight.type.toUpperCase()}
          </span>
          <span className="text-xs font-semibold text-[var(--color-fg-secondary)]">
            Impact: <span className="text-[var(--color-fg-primary)]">{insight.impact.toUpperCase()}</span>
          </span>
        </div>
        <span className={cn("text-xs font-medium", styles.confidence)}>
          {Math.round(insight.confidence * 100)}% confidence
        </span>
      </div>

      <motion.h3
        className="text-lg font-semibold text-[var(--color-fg-primary)] leading-snug mb-3"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {insight.title}
      </motion.h3>

      <p className="text-sm text-[var(--color-fg-secondary)] leading-relaxed mb-4">{insight.summary}</p>

      <div className="text-xs text-[var(--color-fg-secondary)]">
        <span className="font-semibold text-[var(--color-fg-tertiary)]">Owner: </span>
        <span className="text-[var(--color-fg-primary)]">{insight.owner}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {insight.sources.map((source) => (
          <a
            key={source.url}
            href={source.url}
            className="text-xs px-3 py-1 rounded-full bg-[var(--color-bg-subtle)] text-[var(--color-fg-primary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-accent)]/40 transition-colors"
          >
            {source.label}
          </a>
        ))}
      </div>

      {insight.suggestedActions?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {insight.suggestedActions.map((action) => (
            <button
              key={action.id}
              className={cn(
                "text-xs px-3 py-1 rounded-full border font-medium transition-colors",
                action.intent === "primary"
                  ? "bg-[var(--color-accent)] text-white border-transparent"
                  : "bg-transparent border-[var(--color-border-subtle)] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg-primary)]",
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

