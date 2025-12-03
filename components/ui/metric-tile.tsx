"use client"

import * as React from "react"
import { Card } from "./card"
import { cn } from "@/lib/utils"

export interface MetricTileProps {
  label: string
  value: string | number
  trend?: {
    direction: "up" | "down"
    percentage: number
  }
  className?: string
}

/**
 * MetricTile - Displays a KPI with trend indicator
 * iOS-style card with clean typography
 */
export function MetricTile({ label, value, trend, className }: MetricTileProps) {
  return (
    <Card 
      className={cn(
        "p-4 relative overflow-hidden border-l-[3px]",
        trend && trend.direction === "up" && "border-l-[var(--color-success)]",
        trend && trend.direction === "down" && "border-l-[var(--color-error)]",
        !trend && "border-l-[var(--color-accent)]",
        className
      )}
    >
      <div className="flex flex-col space-y-1">
        {/* Label */}
        <p className="text-xs text-[var(--color-fg-secondary)] font-ui">
          {label}
        </p>
        
        {/* Value */}
        <p className="text-2xl font-semibold text-[var(--color-fg-primary)] tabular-nums font-heading tracking-wide">
          {value}
        </p>
        
        {/* Trend */}
        {trend && (
          <div className="flex items-center space-x-2">
            {/* Arrow Icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={cn(
                "transition-colors",
                trend.direction === "up"
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-error)]",
                trend.direction === "down" && "rotate-180"
              )}
            >
              <path
                d="M8 3L12 7L11 8L8.5 5.5V13H7.5V5.5L5 8L4 7L8 3Z"
                fill="currentColor"
              />
            </svg>
            
            {/* Percentage */}
            <span
              className={cn(
                "text-sm font-medium tabular-nums font-ui",
                trend.direction === "up"
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-error)]"
              )}
            >
              {trend.percentage}%
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}

