"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import { cn } from "@/lib/utils"

interface InviteMemberModalProps {
    isOpen: boolean
    onClose: () => void
    organizationId: string
}

export function InviteMemberModal({ isOpen, onClose, organizationId }: InviteMemberModalProps) {
    const [email, setEmail] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [success, setSuccess] = React.useState(false)
    const [validationError, setValidationError] = React.useState<string | null>(null)

    const [inviteLink, setInviteLink] = React.useState<string | null>(null)
    const modalRef = useFocusTrap(isOpen)

    const validateEmail = (emailValue: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailValue.trim()) {
            setValidationError("Email is required")
            return false
        }
        if (!emailRegex.test(emailValue)) {
            setValidationError("Please enter a valid email address")
            return false
        }
        setValidationError(null)
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateEmail(email)) {
            return
        }
        
        setLoading(true)
        setError(null)
        setValidationError(null)
        setInviteLink(null)

        try {
            const response = await fetch("/api/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, organizationId }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (data.requiresManual) {
                    // Fallback to manual SQL if invites table doesn't exist
                    setError(data.error + "\n\nSQL to run:\n" + data.sql)
                } else {
                    setError(data.error || "Failed to create invite")
                }
                setLoading(false)
                return
            }

            setInviteLink(data.inviteLink)
            setSuccess(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to invite member")
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink)
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
            aria-labelledby="invite-modal-title"
        >
            <div
                ref={modalRef as React.RefObject<HTMLDivElement>}
                className="bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border-subtle)] shadow-2xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 id="invite-modal-title" className="text-lg font-semibold text-[var(--color-fg-primary)]">Invite Team Member</h2>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-full hover:bg-[var(--color-bg-subtle)] flex items-center justify-center text-[var(--color-fg-secondary)]"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                {success && inviteLink ? (
                    <div className="py-4">
                        <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-[var(--color-fg-primary)] font-medium mb-4 text-center">Invite created!</p>
                        <div className="bg-[var(--color-bg-subtle)] rounded-lg p-3 mb-3">
                            <p className="text-xs text-[var(--color-fg-tertiary)] mb-2">Share this link:</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inviteLink}
                                    readOnly
                                    className="flex-1 px-3 py-2 text-sm rounded bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-[var(--color-fg-primary)]"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="px-4 py-2 rounded bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity text-sm"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                onClose()
                                setEmail("")
                                setSuccess(false)
                                setInviteLink(null)
                            }}
                            className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-subtle)] text-[var(--color-fg-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[var(--color-fg-primary)] mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    if (validationError) {
                                        validateEmail(e.target.value)
                                    }
                                }}
                                onBlur={() => validateEmail(email)}
                                placeholder="colleague@example.com"
                                required
                                className={cn(
                                    "w-full px-4 py-2.5 rounded-lg border bg-[var(--color-bg-base)] text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)] focus:outline-none focus:ring-2 focus:border-transparent transition-colors",
                                    validationError
                                        ? "border-[var(--color-error)] focus:ring-[var(--color-error)]/40"
                                        : "border-[var(--color-border-subtle)] focus:ring-[var(--color-accent)]/40"
                                )}
                                aria-invalid={validationError ? "true" : "false"}
                                aria-describedby={validationError ? "email-error" : undefined}
                            />
                            {validationError && (
                                <p id="email-error" className="mt-1 text-xs text-[var(--color-error)]">
                                    {validationError}
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-red-500">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--color-border-subtle)] text-[var(--color-fg-primary)] hover:bg-[var(--color-bg-subtle)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {loading ? "Inviting..." : "Send Invite"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
