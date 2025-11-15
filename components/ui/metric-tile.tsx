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
        "p-5 relative overflow-hidden",
        trend && "border-t-[3px]",
        trend?.direction === "up" && "border-t-[var(--color-success)]",
        trend?.direction === "down" && "border-t-[var(--color-error)]",
        className
      )}
    >
      <div className="flex flex-col space-y-2">
        {/* Label */}
        <p className="text-sm text-[var(--color-fg-secondary)]">
          {label}
        </p>
        
        {/* Value */}
        <p className="text-3xl font-semibold text-[var(--color-fg-primary)] tabular-nums">
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
                "text-sm font-medium tabular-nums",
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

