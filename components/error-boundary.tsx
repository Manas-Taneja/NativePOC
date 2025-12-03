"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback || DefaultErrorFallback
      return <Fallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="mb-6">
        <div className="h-16 w-16 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-[var(--color-error)]"
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
        <h2 className="text-xl font-semibold text-[var(--color-fg-primary)] mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-[var(--color-fg-secondary)] mb-4 max-w-md">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          onClick={resetError}
          variant="default"
          className="bg-[var(--color-accent)] text-white"
        >
          Try again
        </Button>
        <Button
          onClick={() => window.location.reload()}
          variant="ghost"
          className="border border-[var(--color-border-subtle)]"
        >
          Reload page
        </Button>
      </div>
      {process.env.NODE_ENV === "development" && (
        <details className="mt-8 text-left max-w-2xl w-full">
          <summary className="text-sm text-[var(--color-fg-tertiary)] cursor-pointer mb-2">
            Error details (development only)
          </summary>
          <pre className="text-xs bg-[var(--color-bg-subtle)] p-4 rounded-lg overflow-auto border border-[var(--color-border-subtle)]">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  )
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundaryClass {...props} />
}

