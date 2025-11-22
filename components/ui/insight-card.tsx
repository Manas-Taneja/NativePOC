"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card"
import { cn } from "@/lib/utils"
import { Insight } from "@/lib/mock-data"
import { formatRelativeTime } from "@/lib/utils"

interface InsightCardProps {
  insight: Insight
  className?: string
}

/**
 * InsightCard - Displays insights from Native
 */
export function InsightCard({ insight, className }: InsightCardProps) {
  const iconColors = {
    alert: "text-[var(--color-error)]",
    suggestion: "text-[var(--color-accent)]",
    info: "text-[var(--color-success)]",
  }

  const bgColors = {
    alert: "bg-[var(--color-error)]/10",
    suggestion: "bg-[var(--color-accent)]/10",
    info: "bg-[var(--color-success)]/10",
  }

  return (
    <Card 
      className={cn(
        "relative border-l-[3px]",
        insight.type === "alert" && "border-l-[var(--color-error)]",
        insight.type === "suggestion" && "border-l-[var(--color-accent)]",
        insight.type === "info" && "border-l-[var(--color-success)]",
        className
      )}
    >
      <div className="p-5">
        {/* Header with icon and timestamp */}
        <div className="flex items-start justify-between mb-3">
          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", bgColors[insight.type])}>
            {insight.type === "alert" && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={iconColors[insight.type]}
              >
                <path
                  d="M8 1L15 14H1L8 1Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M8 6V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
              </svg>
            )}
            {insight.type === "suggestion" && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={iconColors[insight.type]}
              >
                <path
                  d="M8 2C4.7 2 2 4.7 2 8C2 11.3 4.7 14 8 14C11.3 14 14 11.3 14 8C14 4.7 11.3 2 8 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M8 5V8L10.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
            {insight.type === "info" && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={iconColors[insight.type]}
              >
                <path
                  d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M8 11V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="5.5" r="0.5" fill="currentColor" />
              </svg>
            )}
          </div>
          <span className="text-xs text-[var(--color-fg-tertiary)]" suppressHydrationWarning>
            {formatRelativeTime(insight.timestamp)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-[var(--color-fg-primary)] mb-2">
          {insight.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-[var(--color-fg-secondary)] leading-relaxed">
          {insight.description}
        </p>
      </div>
    </Card>
  )
}

