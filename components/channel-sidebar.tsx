"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Channel, ChatMember } from "@/hooks/useChat"
import { useUser } from "@/contexts/user-context"

type ChannelSidebarProps = {
  channels: Channel[]
  currentChannel: Channel | null
  members: ChatMember[]
  organizationName?: string
  onSelectChannel?: (channel: Channel) => void
  onInvite?: () => void
  onToggleCollapse?: () => void
  collapsed?: boolean
  className?: string
  onNewDM?: () => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

const iconMap: Record<Channel["type"], string> = {
  "ai-assistant": "✨",
  team: "#",
  direct: "→",
}

const getInitials = (name?: string | null) =>
  name
    ?.split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?"

export function ChannelSidebar({
  channels,
  currentChannel,
  members,
  organizationName = "NativeIQ",
  onSelectChannel,
  onInvite,
  onNewDM,
  onToggleCollapse,
  collapsed = false,
  className,
  isMobileOpen = false,
  onMobileClose,
}: ChannelSidebarProps) {
  const { userId: currentUserId } = useUser()
  const [isHovered, setIsHovered] = React.useState(false)
  const isExpanded = !collapsed || isHovered

  const handleChannelSelect = (channel: Channel) => {
    onSelectChannel?.(channel)
    onMobileClose?.()
  }

  const renderSidebarContent = (showCloseButton = false) => (
    <>
      {showCloseButton && (
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-fg-primary)] z-50"
          aria-label="Close sidebar"
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
      {onToggleCollapse && !showCloseButton && (
        <button
          type="button"
          className="absolute -right-3 top-10 z-50 h-8 w-8 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] text-[var(--color-fg-primary)] shadow-sm flex items-center justify-center"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          onClick={onToggleCollapse}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={isExpanded ? "rotate-180" : ""}
          >
            <path
              d="M12 4L8 10L12 16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      <header className="border-b border-[var(--color-border-subtle)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-secondary)] flex items-center justify-center font-semibold text-[var(--color-bg-base)]">
            {organizationName[0] ?? "N"}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-fg-primary)] font-ui">{organizationName}</p>
            <span className="text-xs text-[var(--color-fg-tertiary)] font-ui">{members.length} members</span>
          </div>
        </div>
      </header>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto">
          {/* AI Assistant */}
          <section className="mb-6">
            <h4 className="px-5 mb-2 text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-accent)] font-semibold">
              Native AI
            </h4>
            <ul>
              {channels
                .filter((ch) => ch.type === "ai-assistant")
                .map((channel) => (
                  <li key={channel.id}>
                    <button
                      onClick={() => handleChannelSelect(channel)}
                      className={cn(
                        "w-full px-5 py-2 text-left text-sm transition-colors flex items-center gap-3 font-ui",
                        currentChannel?.id === channel.id
                          ? "bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active-text)] font-medium"
                          : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-subtle)]"
                      )}
                    >
                      {currentChannel?.id === channel.id && (
                        <div className="h-2 w-2 rounded-full bg-[var(--color-sidebar-active-text)]" />
                      )}
                      <span>{channel.name}</span>
                    </button>
                  </li>
                ))}
            </ul>
          </section>

          {/* Team Chat */}
          <section className="mb-6">
            <h4 className="px-5 mb-2 text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-accent-secondary)] font-semibold">
              Team Chat (with AI)
            </h4>
            <ul>
              {channels
                .filter((ch) => ch.type === "team")
                .map((channel, index) => {
                  const colors = [
                    "bg-[var(--color-accent-secondary)]",
                    "bg-[var(--color-accent)]",
                    "bg-[var(--color-accent-secondary)]/80",
                  ]
                  const colorClass = colors[index % colors.length]
                  return (
                    <li key={channel.id}>
                      <button
                        onClick={() => handleChannelSelect(channel)}
                        className={cn(
                          "w-full px-5 py-2 text-left text-sm transition-colors flex items-center gap-3 font-ui",
                          currentChannel?.id === channel.id
                            ? "bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active-text)] font-medium"
                            : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-accent-secondary)]/5"
                        )}
                      >
                        <div className={cn("h-2 w-2 rounded-full", colorClass)} />
                        <span>{channel.name}</span>
                      </button>
                    </li>
                  )
                })}
            </ul>
          </section>

          {/* Direct Messages */}
          <section className="mb-6">
            <div className="flex items-center justify-between px-5 mb-2">
              <h4 className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-accent)] font-semibold">
                Direct Messages
              </h4>
              <button
                type="button"
                className="h-6 w-6 rounded-md border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm hover:bg-[var(--color-accent)]/20 hover:border-[var(--color-accent)]/50 transition-colors font-semibold"
                onClick={() => onNewDM?.()}
                aria-label="New direct message"
              >
                +
              </button>
            </div>
            <ul>
              {channels
                .filter((ch) => ch.type === "direct")
                .slice(0, 5) // Show only 5 most recent
                .map((channel, index) => {
                  // For DM channels, show the OTHER person's name
                  const participants = channel.metadata?.participants || []
                  const participantNames = channel.metadata?.participantNames || {}

                  // Find the other user's ID
                  const otherUserId = participants.find((id: string) => id !== currentUserId)
                  // Get the other user's name
                  const displayName = otherUserId ? participantNames[otherUserId] : channel.name

                  const avatarColors = [
                    "bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-secondary)]",
                    "bg-gradient-to-br from-[var(--color-accent-secondary)] to-[var(--color-accent)]",
                    "bg-[var(--color-accent)]",
                    "bg-[var(--color-accent-secondary)]",
                  ]
                  const avatarClass = avatarColors[index % avatarColors.length]

                  return (
                    <li key={channel.id}>
                      <button
                        onClick={() => handleChannelSelect(channel)}
                        className={cn(
                          "w-full px-5 py-2 text-left text-sm transition-colors flex items-center gap-3 font-ui",
                          currentChannel?.id === channel.id
                            ? "bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active-text)] font-medium"
                            : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-accent)]/5"
                        )}
                      >
                        <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white", avatarClass)}>
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <span>{displayName}</span>
                      </button>
                    </li>
                  )
                })}
            </ul>
          </section>

          {/* Team Members */}
          <section>
            <div className="flex items-center justify-between px-5 mb-2">
              <h4 className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-accent-secondary)] font-semibold">Team Members</h4>
              <button
                type="button"
                className="h-6 w-6 rounded-md border border-[var(--color-accent-secondary)]/30 bg-[var(--color-accent-secondary)]/10 text-[var(--color-accent-secondary)] text-sm hover:bg-[var(--color-accent-secondary)]/20 hover:border-[var(--color-accent-secondary)]/50 transition-colors font-semibold"
                onClick={() => onInvite?.()}
                aria-label="Invite team member"
              >
                +
              </button>
            </div>
            <ul>
              {members.map((member, index) => {
                const avatarColors = [
                  "bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-secondary)]",
                  "bg-gradient-to-br from-[var(--color-accent-secondary)] to-[var(--color-accent)]",
                  "bg-[var(--color-accent)]",
                  "bg-[var(--color-accent-secondary)]",
                ]
                const avatarClass = avatarColors[index % avatarColors.length]
                return (
                  <li key={member.id} className="px-5 py-2 flex items-center gap-3 hover:bg-[var(--color-bg-subtle)] rounded-lg transition-colors">
                    <span className={cn("h-7 w-7 rounded-full text-[0.7rem] font-semibold flex items-center justify-center text-white", avatarClass)}>
                      {getInitials(member.full_name)}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-[var(--color-fg-primary)] font-ui">{member.full_name}</p>
                    </div>
                    {member.role === "owner" && (
                      <span className="text-[0.6rem] uppercase tracking-wide px-2 py-0.5 rounded-lg bg-[var(--color-accent-secondary)]/20 text-[var(--color-accent-secondary)] border border-[var(--color-accent-secondary)]/40 font-ui">Owner</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <aside
          className={cn(
            "fixed top-0 left-0 h-full w-64 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-sidebar)] shadow-2xl transition-transform duration-300 ease-in-out pointer-events-auto z-[65] rounded-r-2xl",
            isExpanded ? "translate-x-0" : "translate-x-[calc(-100%+16px)]",
            className,
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {renderSidebarContent(false)}
        </aside>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
              aria-hidden="true"
            />
            {/* Mobile Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-64 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-sidebar)] shadow-2xl z-[65] lg:hidden"
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

