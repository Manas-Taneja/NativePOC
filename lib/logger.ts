/**
 * Logger utility for development and production
 * Only logs in development mode to avoid console noise in production
 */

const isDevelopment = process.env.NODE_ENV === "development"

type LogLevel = "log" | "info" | "warn" | "error" | "debug"

class Logger {
  private shouldLog(level: LogLevel): boolean {
    // Always log errors, even in production (but consider using proper error tracking)
    if (level === "error") return true
    // Only log other levels in development
    return isDevelopment
  }

  log(...args: unknown[]): void {
    if (this.shouldLog("log")) {
      console.log(...args)
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog("info")) {
      console.info(...args)
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog("warn")) {
      console.warn(...args)
    }
  }

  error(...args: unknown[]): void {
    // Always log errors, but in production you might want to send to error tracking service
    console.error(...args)
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog("debug")) {
      console.debug(...args)
    }
  }
}

export const logger = new Logger()

