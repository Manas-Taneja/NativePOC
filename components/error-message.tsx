"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ErrorMessageProps {
  error: string | null
  onDismiss?: () => void
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({ error, onDismiss, onRetry, className }: ErrorMessageProps) {
  if (!error) return null

  return (
    <div
      className={cn(
        "p-4 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 flex items-start gap-3",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">
        <svg
          className="w-5 h-5 text-[var(--color-error)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-error)] mb-1">Error</p>
        <p className="text-sm text-[var(--color-error)]/80">{error}</p>
        {(onRetry || onDismiss) && (
          <div className="flex gap-2 mt-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs px-3 py-1.5 rounded-md bg-[var(--color-error)] text-white hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-xs px-3 py-1.5 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-fg-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 h-6 w-6 rounded-full hover:bg-[var(--color-error)]/20 flex items-center justify-center text-[var(--color-error)] transition-colors"
          aria-label="Dismiss error"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

