"use client"

import * as React from "react"
import type { Insight } from "@native/types"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type InsightCardProps = {
  insight: Insight
}

const toneStyles: Record<Insight["type"], { badge: string; confidence: string }> = {
  decision: { badge: "bg-[var(--color-accent-secondary)]/20 border-[var(--color-accent-secondary)]/40 text-[var(--color-accent-secondary)]", confidence: "text-[var(--color-fg-secondary)]" },
  risk: { badge: "bg-[var(--color-error)]/15 border-[var(--color-error)]/40 text-[var(--color-error)]", confidence: "text-[var(--color-error)]/80" },
  blocker: { badge: "bg-[var(--color-error)]/15 border-[var(--color-error)]/40 text-[var(--color-error)]", confidence: "text-[var(--color-error)]/80" },
  trend: { badge: "bg-[var(--color-success)]/15 border-[var(--color-success)]/40 text-[var(--color-success)]", confidence: "text-[var(--color-success)]/80" },
  summary: { badge: "bg-[var(--color-fg-tertiary)]/10 border-[var(--color-border-subtle)] text-[var(--color-fg-secondary)]", confidence: "text-[var(--color-fg-secondary)]" },
}

export default function InlineInsightCard({ insight }: InsightCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const styles = toneStyles[insight.type]

  // Truncate summary for collapsed view (first 100 chars)
  const truncatedSummary = insight.summary.length > 100 
    ? insight.summary.slice(0, 100) + "..."
    : insight.summary

  return (
    <div className="relative rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]/90 backdrop-blur-xl p-3 shadow-sm">
      {/* Header - Always visible */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold border shrink-0 font-ui", styles.badge)}>
              {insight.type.toUpperCase()}
            </span>
            <span className="text-[10px] font-semibold text-[var(--color-fg-secondary)] shrink-0 font-ui">
              {insight.impact.toUpperCase()}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-[var(--color-fg-primary)] leading-snug font-heading tracking-wide">
            {insight.title}
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
                        className="shrink-0 h-6 w-6 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] flex items-center justify-center hover:bg-[var(--color-bg-elevated)] transition-colors"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          <motion.svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--color-fg-secondary)]"
            />
          </motion.svg>
        </button>
      </div>

      {/* Summary - Always visible, truncated when collapsed */}
      <p className="text-xs text-[var(--color-fg-secondary)] leading-relaxed mb-2 font-ui">
        {isExpanded ? insight.summary : truncatedSummary}
      </p>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-3 border-t border-[var(--color-border-subtle)]">
              {/* Owner */}
              <div className="text-[10px] text-[var(--color-fg-secondary)]">
                <span className="font-semibold text-[var(--color-fg-tertiary)]">Owner: </span>
                <span className="text-[var(--color-fg-primary)]">{insight.owner}</span>
              </div>

              {/* Confidence */}
              <div className="text-[10px] text-[var(--color-fg-secondary)]">
                <span className="font-semibold text-[var(--color-fg-tertiary)]">Confidence: </span>
                <span className={cn("font-medium", styles.confidence)}>
                  {Math.round(insight.confidence * 100)}%
                </span>
              </div>

              {/* Sources */}
              {insight.sources.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-[var(--color-fg-tertiary)] mb-1.5">Sources:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {insight.sources.map((source) => (
                      <a
                        key={source.url}
                        href={source.url}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-[var(--color-bg-subtle)] text-[var(--color-fg-primary)] border border-[var(--color-accent-secondary)]/30 hover:border-[var(--color-accent-secondary)]/50 transition-colors font-ui"
                      >
                        {source.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Actions */}
              {insight.suggestedActions?.length ? (
                <div>
                  <p className="text-[10px] font-semibold text-[var(--color-fg-tertiary)] mb-1.5">Actions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {insight.suggestedActions.map((action) => (
                      <button
                        key={action.id}
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-lg border font-medium transition-colors font-ui",
                          action.intent === "primary"
                            ? "bg-[var(--color-accent)] text-white border-transparent"
                            : "bg-transparent border-[var(--color-accent-secondary)]/30 text-[var(--color-accent-secondary)] hover:bg-[var(--color-accent-secondary)]/10",
                        )}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

