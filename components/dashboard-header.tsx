"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "./ui/button"
import { ThemeToggle } from "./theme-toggle"
import { SignalTicker } from "@/components/sections/signal-ticker"
import type { Insight, SlaMetric } from "@native/types"
import { cn } from "@/lib/utils"
import { useUser } from "@/contexts/user-context"
import { createClient } from "@/lib/supabase/client"

export interface DashboardHeaderProps {
  className?: string
  insights?: Insight[]
  metrics?: SlaMetric[]
  onMobileMenuClick?: () => void
}

/**
 * DashboardHeader - Sticky header with iOS-style frosted glass effect
 * Blur increases on scroll for that Safari-like feel
 */
const quickActions = [
  { id: "report", label: "New Report", icon: "M2 8H14M8 2V14" },
  { id: "analytics", label: "View Analytics", icon: "M3 5H13M3 8H13M3 11H9" },
  { id: "export", label: "Export Data", icon: "M14 9V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V9 M8 10V2M8 2L5 5M8 2L11 5" },
  { id: "refresh", label: "Refresh Data", icon: "M13.5 8C13.5 10.7614 11.2614 13 8.5 13C5.73858 13 3.5 10.7614 3.5 8C3.5 5.23858 5.73858 3 8.5 3 M13.5 3V8H8.5" },
]

export function DashboardHeader({ className, insights = [], metrics = [], onMobileMenuClick }: DashboardHeaderProps) {
  const [quickOpen, setQuickOpen] = React.useState(false)
  const quickRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (quickRef.current && !quickRef.current.contains(event.target as Node)) {
        setQuickOpen(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && quickOpen) {
        setQuickOpen(false)
      }
    }
    if (quickOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [quickOpen])
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
          {/* Mobile Menu Button */}
          {onMobileMenuClick && (
            <button
              onClick={onMobileMenuClick}
              className="lg:hidden h-10 w-10 rounded-full bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-fg-primary)] mr-2"
              aria-label="Open menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 5H17M3 10H17M3 15H17"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold text-[var(--color-fg-primary)] font-heading tracking-wide">
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
            <span className="text-sm font-ui">
              Search
            </span>
            <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-[var(--color-bg-subtle)] rounded border border-[var(--color-border-subtle)]">
              ⌘K
            </kbd>
          </Button>

          {/* Quick Actions */}
          <div className="relative" ref={quickRef}>
            <Button variant="ghost" size="small" onClick={() => setQuickOpen((prev) => !prev)} aria-expanded={quickOpen}>
              <span className="font-ui">Quick Actions</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2 transition-transform"
                style={{ transform: quickOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                <path
                  d="M5 8L10 13L15 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
            {quickOpen && (
              <div 
                className="absolute right-0 mt-2 w-60 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] shadow-2xl overflow-hidden z-50"
                role="menu"
                aria-label="Quick actions"
              >
                <ul className="divide-y divide-[var(--color-border-subtle)]" role="menu">
                  {quickActions.map((action, index) => {
                    const iconColors = [
                      "text-[var(--color-accent)]",
                      "text-[var(--color-accent-secondary)]",
                      "text-[var(--color-accent)]",
                      "text-[var(--color-accent-secondary)]",
                    ]
                    const iconClass = iconColors[index % iconColors.length]
                    return (
                      <li key={action.id} role="menuitem">
                        <button 
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-fg-primary)] hover:bg-[var(--color-accent)]/5 transition-colors focus:outline-none focus:bg-[var(--color-accent)]/5"
                          role="menuitem"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className={iconClass}
                            aria-hidden="true"
                          >
                            <path d={action.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="font-ui">{action.label}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Notifications */}
          <SignalTicker insights={insights} metrics={metrics} />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </motion.header>
  )
}

function ProfileDropdown() {
  const { user } = useUser()
  const [profile, setProfile] = React.useState<{ full_name: string | null; email: string | null } | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    async function fetchProfile() {
      if (!user) return
      const supabase = createClient()
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()
      
      setProfile({
        full_name: data?.full_name || null,
        email: user.email || null,
      })
    }
    void fetchProfile()
  }, [user])

  const getInitials = (name: string | null | undefined, email: string | null | undefined): string => {
    if (name) {
      return name
        .split(" ")
        .map((segment) => segment[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return "U"
  }

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-secondary)] border-2 border-white/20 flex items-center justify-center text-sm font-medium text-white hover:scale-105 transition-transform shadow-lg"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {getInitials(profile?.full_name, profile?.email)}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] shadow-2xl overflow-hidden z-50"
          role="menu"
          aria-label="User menu"
        >
          <div className="px-4 py-3 border-b border-[var(--color-border-subtle)]">
            <p className="text-sm font-medium text-[var(--color-fg-primary)] font-ui">
              {profile?.full_name || "Account"}
            </p>
            <p className="text-xs text-[var(--color-fg-tertiary)] mt-0.5 font-ui">
              {profile?.email || "Manage your profile"}
            </p>
          </div>
          <ul role="menu">
            <li role="menuitem">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-fg-primary)] hover:bg-[var(--color-bg-subtle)] transition-colors focus:outline-none focus:bg-[var(--color-bg-subtle)]"
                role="menuitem"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[var(--color-fg-secondary)]"
                >
                  <path
                    d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6M11 11L14 8M14 8L11 5M14 8H6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-ui">Sign Out</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
