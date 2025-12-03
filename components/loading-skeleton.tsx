"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[var(--color-bg-subtle)]",
        className
      )}
      aria-label="Loading"
      role="status"
    />
  )
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <LoadingSkeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton className="h-4 w-24" />
            <LoadingSkeleton className="h-16 w-3/4 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MetricSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
      <LoadingSkeleton className="h-4 w-20 mb-2" />
      <LoadingSkeleton className="h-8 w-32 mb-2" />
      <LoadingSkeleton className="h-3 w-16" />
    </div>
  )
}

