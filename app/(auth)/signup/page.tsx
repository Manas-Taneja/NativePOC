"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"

function SignupContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const inviteCode = searchParams.get("invite")

    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [fullName, setFullName] = React.useState("")
    const [orgName, setOrgName] = React.useState("")
    const [inviteData, setInviteData] = React.useState<any>(null)
    const [loadingInvite, setLoadingInvite] = React.useState(false)
    const [inviteError, setInviteError] = React.useState<string | null>(null)
    const [inviteEmails, setInviteEmails] = React.useState<string[]>(["", "", "", "", ""])
    const [inviteStatus, setInviteStatus] = React.useState<string | null>(null)

    const { signUp, loading, error } = useAuth()

    // Check invite code on mount
    React.useEffect(() => {
        async function checkInvite() {
            if (!inviteCode) return

            setLoadingInvite(true)
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from("organization_invites")
                    .select("*, organizations(name)")
                    .eq("token", inviteCode)
                    .eq("status", "pending")
                    .single()

                if (error || !data) {
                    logger.error("Invalid invite code")
                    return
                }

                // Check if expired
                if (new Date(data.expires_at) < new Date()) {
                    logger.error("Invite expired")
                    return
                }

                setInviteData(data)
                setEmail(data.email)
            } catch (err) {
                logger.error("Error checking invite:", err)
            } finally {
                setLoadingInvite(false)
            }
        }

        void checkInvite()
    }, [inviteCode])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (inviteData) {
            // Signup with invite - join existing organization
            try {
                const supabase = createClient()

                // 1. Create auth user
                const { data: authData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                })

                if (signUpError) {
                    logger.error("Auth signup error:", signUpError)
                    setInviteError(signUpError.message)
                    return
                }
                if (!authData.user) {
                    setInviteError("User creation failed")
                    return
                }

                // 2. Update profile with invite's organization (profile may already exist from trigger)
                const { error: profileError } = await supabase
                    .from("profiles")
                    .upsert({
                        id: authData.user.id,
                        organization_id: inviteData.organization_id,
                        full_name: fullName,
                        role: "member",
                    })

                if (profileError) {
                    logger.error("Profile update error:", profileError)
                    setInviteError("Failed to update profile: " + profileError.message)
                    return
                }

                // 3. Mark invite as accepted
                const { error: inviteUpdateError } = await supabase
                    .from("organization_invites")
                    .update({ status: "accepted" })
                    .eq("token", inviteCode)

                if (inviteUpdateError) {
                    logger.error("Invite update error:", inviteUpdateError)
                    // Don't fail if this doesn't work
                }

                router.push("/")
            } catch (err) {
                logger.error("Signup with invite failed:", err)
                setInviteError(err instanceof Error ? err.message : "Signup failed")
            }
        } else {
            // Normal signup - create new organization
            try {
                const result = await signUp(email, password, fullName, orgName)
                const trimmed = inviteEmails.map((v) => v.trim()).filter(Boolean).slice(0, 5)
                if (result?.organization?.id && trimmed.length) {
                    try {
                        const resp = await fetch("/api/invite", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                emails: trimmed,
                                organizationId: result.organization.id,
                            }),
                        })
                        if (!resp.ok) {
                            const errJson = await resp.json().catch(() => ({}))
                            setInviteStatus(errJson?.error ?? "Failed to send invites")
                        } else {
                            setInviteStatus(`Sent ${trimmed.length} invite(s)`)
                        }
                    } catch (error) {
                        logger.error("Invite send failed:", error)
                        setInviteStatus("Failed to send invites")
                    }
                }
                router.push("/")
            } catch (err) {
                // Error is handled by useAuth hook
            }
        }
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[var(--color-fg-primary)] mb-2">
                        {inviteData ? "Join your team" : "Create your account"}
                    </h1>
                    <p className="text-[var(--color-fg-tertiary)]">
                        {inviteData
                            ? `You've been invited to join ${inviteData.organizations?.name || "an organization"}`
                            : "Get started with NativeIQ"
                        }
                    </p>
                </div>

                {loadingInvite && (
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-500 text-sm text-center">
                        Validating invite...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="fullName"
                            className="block text-sm font-medium text-[var(--color-fg-secondary)] mb-2"
                        >
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full px-4 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg text-[var(--color-fg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                            placeholder="John Doe"
                        />
                    </div>

                    {!inviteData && (
                        <div>
                            <label
                                htmlFor="orgName"
                                className="block text-sm font-medium text-[var(--color-fg-secondary)] mb-2"
                            >
                                Organization Name
                            </label>
                            <input
                                id="orgName"
                                type="text"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                required={!inviteData}
                                className="w-full px-4 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg text-[var(--color-fg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                                placeholder="Acme Inc"
                            />
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-[var(--color-fg-secondary)] mb-2"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            readOnly={!!inviteData}
                            className="w-full px-4 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg text-[var(--color-fg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent disabled:opacity-50"
                            placeholder="you@example.com"
                        />
                        {inviteData && (
                            <p className="mt-1 text-xs text-[var(--color-fg-tertiary)]">
                                This invite is for {email}
                            </p>
                        )}
                    </div>

                    {!inviteData && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-[var(--color-fg-secondary)]">
                                    Invite up to 5 teammates (emails)
                                </label>
                                <span className="text-xs text-[var(--color-fg-tertiary)]">Optional</span>
                            </div>
                            {inviteEmails.map((value, idx) => (
                                <input
                                    key={idx}
                                    type="email"
                                    value={value}
                                    onChange={(e) => {
                                        const next = [...inviteEmails]
                                        next[idx] = e.target.value
                                        setInviteEmails(next)
                                    }}
                                    placeholder={`teammate${idx + 1}@example.com`}
                                    className="w-full px-4 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg text-[var(--color-fg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                                />
                            ))}
                            {inviteStatus && (
                                <p className="text-xs text-[var(--color-fg-tertiary)]">{inviteStatus}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-[var(--color-fg-secondary)] mb-2"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg text-[var(--color-fg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                            placeholder="••••••••"
                        />
                        <p className="mt-1 text-xs text-[var(--color-fg-tertiary)]">
                            Must be at least 6 characters
                        </p>
                    </div>

                    {(error || inviteError) && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                            {error || inviteError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-[var(--color-fg-tertiary)]">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="text-[var(--color-accent)] hover:underline font-medium"
                    >
                        Sign in
                    </Link>
                </div>
            </Card>
        </div>
    )
}

export default function SignupPage() {
    return (
        <React.Suspense fallback={
            <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full"></div>
            </div>
        }>
            <SignupContent />
        </React.Suspense>
    )
}
