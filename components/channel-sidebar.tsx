"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { Channel, ChatMember } from "@/hooks/useChat"

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
}: ChannelSidebarProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const isExpanded = !collapsed || isHovered

  return (
    <div className="hidden lg:block">
      {/* Hover handle */}
      <div
        className="fixed inset-y-0 left-0 w-6 pointer-events-auto z-[70]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-24 rounded-r-full bg-[var(--color-bg-elevated)]/70 hover:bg-[var(--color-accent)]/50 transition-colors shadow-lg"
        />
      </div>

      {/* Drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] shadow-2xl transition-transform duration-300 ease-in-out pointer-events-auto z-[65]",
          isExpanded ? "translate-x-0" : "-translate-x-full",
          className,
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {onToggleCollapse && (
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
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-bg-highlight)] flex items-center justify-center font-semibold text-[var(--color-bg-base)]">
              {organizationName[0] ?? "N"}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-fg-primary)]">{organizationName}</p>
              <span className="text-xs text-[var(--color-fg-tertiary)]">{members.length} members</span>
            </div>
          </div>
        </header>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto">
          {/* AI Assistant */}
          <section className="mb-6">
            <h4 className="px-5 mb-2 text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-fg-tertiary)]">
              Native AI
            </h4>
            <ul>
              {channels
                .filter((ch) => ch.type === "ai-assistant")
                .map((channel) => (
                  <li key={channel.id}>
                    <button
                      onClick={() => onSelectChannel?.(channel)}
                      className={cn(
                        "w-full px-5 py-2 text-left text-sm transition-colors flex items-center gap-3",
                        currentChannel?.id === channel.id
                          ? "bg-[var(--color-bg-elevated)] text-[var(--color-fg-primary)] font-medium"
                          : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-subtle)]"
                      )}
                    >
                      <div className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                      <span>{channel.name}</span>
                    </button>
                  </li>
                ))}
            </ul>
          </section>

          {/* Team Chat */}
          <section className="mb-6">
            <h4 className="px-5 mb-2 text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-fg-tertiary)]">
              Team Chat (with AI)
            </h4>
            <ul>
              {channels
                .filter((ch) => ch.type === "team")
                .map((channel) => (
                  <li key={channel.id}>
                    <button
                      onClick={() => onSelectChannel?.(channel)}
                      className={cn(
                        "w-full px-5 py-2 text-left text-sm transition-colors flex items-center gap-3",
                        currentChannel?.id === channel.id
                          ? "bg-[var(--color-bg-elevated)] text-[var(--color-fg-primary)] font-medium"
                          : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-subtle)]"
                      )}
                    >
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>{channel.name}</span>
                    </button>
                  </li>
                ))}
            </ul>
          </section>

          {/* Direct Messages */}
          <section className="mb-6">
            <div className="flex items-center justify-between px-5 mb-2">
              <h4 className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-fg-tertiary)]">
                Direct Messages
              </h4>
              <button
                type="button"
                className="h-6 w-6 rounded-md border border-[var(--color-border-subtle)] text-[var(--color-fg-secondary)] text-sm hover:bg-[var(--color-bg-subtle)] transition-colors"
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
                .map((channel) => {
                  // For DM channels, show the OTHER person's name
                  const currentUserId = (window as any).__currentUserId
                  const participants = channel.metadata?.participants || []
                  const participantNames = channel.metadata?.participantNames || {}

                  // Find the other user's ID
                  const otherUserId = participants.find((id: string) => id !== currentUserId)
                  // Get the other user's name
                  const displayName = otherUserId ? participantNames[otherUserId] : channel.name

                  return (
                    <li key={channel.id}>
                      <button
                        onClick={() => onSelectChannel?.(channel)}
                        className={cn(
                          "w-full px-5 py-2 text-left text-sm transition-colors flex items-center gap-3",
                          currentChannel?.id === channel.id
                            ? "bg-[var(--color-bg-elevated)] text-[var(--color-fg-primary)] font-medium"
                            : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-subtle)]"
                        )}
                      >
                        <div className="h-2 w-2 rounded-full bg-green-500" />
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
              <h4 className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-fg-tertiary)]">Team Members</h4>
              <button
                type="button"
                className="h-6 w-6 rounded-md border border-[var(--color-border-subtle)] text-[var(--color-fg-secondary)] text-sm hover:bg-[var(--color-bg-subtle)] transition-colors"
                onClick={() => onInvite?.()}
                aria-label="Invite team member"
              >
                +
              </button>
            </div>
            <ul>
              {members.map((member) => (
                <li key={member.id} className="px-5 py-2 flex items-center gap-3">
                  <span className="h-7 w-7 rounded-full bg-[var(--color-bg-subtle)] text-[0.7rem] font-semibold flex items-center justify-center text-[var(--color-fg-secondary)]">
                    {getInitials(member.full_name)}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--color-fg-primary)]">{member.full_name}</p>
                  </div>
                  {member.role === "owner" && (
                    <span className="text-[0.6rem] uppercase tracking-wide text-[var(--color-accent)]">Owner</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>
    </div>
  )
}

