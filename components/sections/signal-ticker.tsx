"use client"

import * as React from "react"
import type { Insight, SlaMetric } from "@native/types"
import { cn, formatRelativeTime } from "@/lib/utils"

type SignalTickerProps = {
  insights: Insight[]
  metrics: SlaMetric[]
}

export function SignalTicker({ insights, metrics }: SignalTickerProps) {
  const [open, setOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const notifications = React.useMemo(() => {
    const metricAlerts = metrics
      .filter((metric) => metric.value > metric.target)
      .map((metric) => ({
        id: `metric-${metric.label}`,
        title: `${metric.label} over target`,
        detail: `${metric.value}${metric.unit} vs ${metric.target}${metric.unit}`,
        timestamp: new Date().toISOString(),
        tone: "negative" as const,
      }))

    const insightAlerts = insights.slice(0, 5).map((insight) => ({
      id: insight.id,
      title: insight.title,
      detail: insight.summary || "Insight available",
      timestamp: insight.sources?.[0]?.timestamp ?? new Date().toISOString(),
      tone:
        insight.type === "risk" || insight.type === "blocker"
          ? ("negative" as const)
          : insight.type === "trend" || insight.type === "decision"
            ? ("positive" as const)
            : ("neutral" as const),
    }))

    return [...metricAlerts, ...insightAlerts].slice(0, 6)
  }, [insights, metrics])

  const unreadCount = notifications.length

  const toneStyles: Record<
    "positive" | "negative" | "neutral",
    { dot: string; title: string; detail: string }
  > = {
    positive: {
      dot: "bg-[var(--color-success)]",
      title: "text-[var(--color-success)]",
      detail: "text-[var(--color-fg-secondary)]",
    },
    negative: {
      dot: "bg-[var(--color-error)]",
      title: "text-[var(--color-error)]",
      detail: "text-[var(--color-fg-secondary)]",
    },
    neutral: {
      dot: "bg-[var(--color-accent-secondary)]",
      title: "text-[var(--color-accent-secondary)]",
      detail: "text-[var(--color-fg-secondary)]",
    },
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className={cn(
          "relative h-10 w-10 rounded-full border-2 border-[var(--color-accent-secondary)]/30 bg-gradient-to-br from-[var(--color-accent-secondary)]/10 to-[var(--color-accent)]/10 text-[var(--color-accent-secondary)] flex items-center justify-center transition-all hover:scale-105 hover:border-[var(--color-accent-secondary)]/60",
          open && "border-[var(--color-accent-secondary)] bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-secondary)]",
        )}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-current"
          aria-hidden="true"
        >
          <path
            d="M10 2C6.68629 2 4 4.68629 4 8V11.382L3.10557 12.2764C2.21086 13.1711 2.83758 14.6667 4.10557 14.6667H15.8944C17.1624 14.6667 17.7891 13.1711 16.8944 12.2764L16 11.382V8C16 4.68629 13.3137 2 10 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M8 15.333H12C12 16.4376 11.1046 17.333 10 17.333C8.89543 17.333 8 16.4376 8 15.333Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[var(--color-accent-secondary)] text-white text-xs font-semibold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-3 w-80 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] shadow-2xl overflow-hidden z-50"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--color-fg-primary)]">Notifications</p>
              <p className="text-xs text-[var(--color-fg-tertiary)]">
                {unreadCount > 0 ? `${unreadCount} insights and alerts` : "All clear for now"}
              </p>
            </div>
            <button 
              className="text-xs text-[var(--color-accent-secondary)]" 
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
            >
              Close
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-sm text-[var(--color-fg-secondary)]">No new notifications.</div>
          ) : (
            <ul className="max-h-80 overflow-y-auto minimal-scrollbar">
              {notifications.map((item) => (
                <li key={item.id} className="px-4 py-3 border-b border-[var(--color-border-subtle)] last:border-b-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", toneStyles[item.tone].dot)} aria-hidden />
                    <p className={cn("text-sm font-semibold", toneStyles[item.tone].title)}>{item.title}</p>
                  </div>
                  <p className={cn("text-xs mt-1", toneStyles[item.tone].detail)}>{item.detail}</p>
                  <p className="text-xs text-[var(--color-fg-tertiary)] mt-1">
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}