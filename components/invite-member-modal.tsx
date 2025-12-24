"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface InviteMemberModalProps {
    isOpen: boolean
    onClose: () => void
    organizationId: string
}

export function InviteMemberModal({ isOpen, onClose, organizationId }: InviteMemberModalProps) {
    const [email, setEmail] = React.useState("")
    const [role, setRole] = React.useState("Member")
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [success, setSuccess] = React.useState(false)
    const [validationError, setValidationError] = React.useState<string | null>(null)
    const [inviteLink, setInviteLink] = React.useState<string | null>(null)

    const modalRef = useFocusTrap(isOpen)

    // Reset state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setEmail("")
            setRole("Member")
            setError(null)
            setSuccess(false)
            setValidationError(null)
            setInviteLink(null)
        }
    }, [isOpen])

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

    const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        if (val.length === 0) {
            setRole("")
            return
        }
        const capitalized = val.charAt(0).toUpperCase() + val.slice(1)
        setRole(capitalized)
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
                body: JSON.stringify({ email, role, organizationId }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (data.requiresManual) {
                    setError(data.error + "\n\nSQL to run:\n" + data.sql)
                } else {
                    setError(data.error || "Failed to create invite")
                }
                setLoading(false)
                return
            }

            setInviteLink(data.inviteLink)
            setSuccess(true)

            // Auto close after success? Or let them copy link?
            // Existing logic has "Done" button or auto-close?
            // The logic I replaced had a success state with a checkmark.
            // Let's stick to the success message.
            setTimeout(() => {
                onClose()
            }, 2000)

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to invite member")
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

                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="py-8 flex flex-col items-center justify-center text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                                className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4"
                            >
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </motion.div>
                            <h3 className="text-xl font-semibold text-[var(--color-fg-primary)] mb-2">Invite Sent!</h3>
                            <p className="text-[var(--color-fg-secondary)] mb-6 max-w-[260px]">
                                We've sent an email to <strong>{email}</strong> as <strong>{role}</strong>
                            </p>
                        </motion.div>
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

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-[var(--color-fg-primary)] mb-2">
                                    Role
                                </label>
                                <input
                                    value={role}
                                    onChange={handleRoleChange}
                                    placeholder="e.g. Member, Admin"
                                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] text-[var(--color-fg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40 focus:border-transparent transition-colors"
                                />
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
                </AnimatePresence>
            </div>
        </div>
    )
}
