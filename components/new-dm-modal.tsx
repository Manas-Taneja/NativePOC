"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { useFocusTrap } from "@/hooks/useFocusTrap"

interface NewDMModalProps {
    isOpen: boolean
    onClose: () => void
    organizationId: string
    currentUserId: string
    onDMCreated: (channelId: string) => void
}

interface TeamMember {
    id: string
    full_name: string
    avatar_url?: string
}

export function NewDMModal({ isOpen, onClose, organizationId, currentUserId, onDMCreated }: NewDMModalProps) {
    const [members, setMembers] = React.useState<TeamMember[]>([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const modalRef = useFocusTrap(isOpen)

    React.useEffect(() => {
        if (!isOpen) return

        async function fetchMembers() {
            setLoading(true)
            try {
                const supabase = createClient()
                const { data, error: fetchError } = await supabase
                    .from("profiles")
                    .select("id, full_name, avatar_url")
                    .eq("organization_id", organizationId)
                    .neq("id", currentUserId) // Exclude current user

                if (fetchError) throw fetchError
                setMembers(data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load team members")
            } finally {
                setLoading(false)
            }
        }

        void fetchMembers()
    }, [isOpen, organizationId, currentUserId])

    const handleSelectMember = async (memberId: string, memberName: string) => {
        setLoading(true)
        setError(null)

        try {
            const supabase = createClient()

            // Get current user's name
            const { data: currentUserProfile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", currentUserId)
                .single()

            const currentUserName = currentUserProfile?.full_name || "User"

            // Check if DM channel already exists with this member
            // We'll use metadata to store the participant IDs
            const { data: existingChannels } = await supabase
                .from("channels")
                .select("*")
                .eq("type", "direct")
                .eq("organization_id", organizationId)

            // Find channel where metadata contains both user IDs
            const existingChannel = existingChannels?.find((channel: any) => {
                const participants = channel.metadata?.participants || []
                return participants.includes(currentUserId) && participants.includes(memberId)
            })

            if (existingChannel) {
                // Channel already exists, just select it
                onDMCreated(existingChannel.id)
                onClose()
                return
            }

            // Create new DM channel with both users in metadata
            const { data: newChannel, error: channelError } = await supabase
                .from("channels")
                .insert({
                    organization_id: organizationId,
                    name: "Direct Message", // Generic name, will be displayed dynamically
                    description: "Direct message",
                    type: "direct",
                    metadata: {
                        participants: [currentUserId, memberId],
                        participantNames: {
                            [currentUserId]: currentUserName,
                            [memberId]: memberName,
                        },
                    },
                })
                .select()
                .single()

            if (channelError) throw channelError

            onDMCreated(newChannel.id)
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create DM")
        } finally {
            setLoading(false)
        }
    }

    // Handle Escape key
    React.useEffect(() => {
        if (!isOpen) return

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        }

        document.addEventListener("keydown", handleEscape)
        return () => document.removeEventListener("keydown", handleEscape)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dm-modal-title"
        >
            <div
                ref={modalRef as React.RefObject<HTMLDivElement>}
                className="bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border-subtle)] shadow-2xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 id="dm-modal-title" className="text-lg font-semibold text-[var(--color-fg-primary)]">New Direct Message</h2>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-full hover:bg-[var(--color-bg-subtle)] flex items-center justify-center text-[var(--color-fg-secondary)]"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-500">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="py-8 text-center text-[var(--color-fg-tertiary)]">Loading team members...</div>
                ) : members.length === 0 ? (
                    <div className="py-8 text-center text-[var(--color-fg-tertiary)]">
                        <p>No other team members found</p>
                        <p className="text-sm mt-2">Invite someone to start a direct message</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="text-sm text-[var(--color-fg-tertiary)] mb-3">Select a team member to message:</p>
                        {members.map((member) => (
                            <button
                                key={member.id}
                                onClick={() => handleSelectMember(member.id, member.full_name)}
                                disabled={loading}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors disabled:opacity-50"
                            >
                                <div className="h-10 w-10 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border-muted)] flex items-center justify-center">
                                    <span className="text-[var(--color-fg-secondary)] font-medium">
                                        {member.full_name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-[var(--color-fg-primary)] font-medium">{member.full_name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
