"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "./ui/button"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"

export interface DashboardHeaderProps {
  className?: string
}

/**
 * DashboardHeader - Sticky header with iOS-style frosted glass effect
 * Blur increases on scroll for that Safari-like feel
 */
export function DashboardHeader({ className }: DashboardHeaderProps) {
  const { scrollY } = useScroll()
  
  // Increase blur and border opacity as user scrolls
  const backdropBlur = useTransform(scrollY, [0, 50], [0, 12])
  const borderOpacity = useTransform(scrollY, [0, 50], [0.06, 0.15])
  const backgroundOpacity = useTransform(scrollY, [0, 50], [0, 0.8])

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        className
      )}
      style={{
        backdropFilter: useTransform(backdropBlur, (value) => `blur(${value}px)`),
        WebkitBackdropFilter: useTransform(backdropBlur, (value) => `blur(${value}px)`),
      }}
    >
      <motion.div
        className="absolute inset-0 bg-[var(--color-bg-base)]"
        style={{ opacity: backgroundOpacity }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-[var(--color-border-subtle)]"
        style={{ opacity: borderOpacity }}
      />
      
      <div className="relative flex h-16 items-center justify-between px-5 md:px-8">
        {/* Logo / Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold text-[var(--color-fg-primary)]">
              Native
            </h1>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Search Trigger */}
          <Button
            variant="ghost"
            size="small"
            className="hidden md:flex"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2"
            >
              <path
                d="M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.5 10.5L14 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm">
              Search
            </span>
            <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-[var(--color-bg-subtle)] rounded border border-[var(--color-border-subtle)]">
              ⌘K
            </kbd>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Avatar */}
          <button className="h-10 w-10 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center text-sm font-medium text-[var(--color-fg-primary)] hover:border-[var(--color-border-muted)] transition-colors">
            JD
          </button>
        </div>
      </div>
    </motion.header>
  )
}

