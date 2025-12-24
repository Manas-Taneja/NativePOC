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
    const [step, setStep] = React.useState<"signup" | "invite">("signup")
    const [createdOrgId, setCreatedOrgId] = React.useState<string | null>(null)
    const [inviteRoles, setInviteRoles] = React.useState<string[]>(["Member", "Member", "Member", "Member", "Member"])

    const { signUp, loading, error } = useAuth()

    // ... existing checkInvite useEffect ...

    // Handle initial signup (Step 1)
    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (inviteData) {
            // Signup with invite - join existing organization
            try {
                const supabase = createClient()

                // 1. Create auth user
                const { data: authData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName } },
                })
                if (signUpError) { setInviteError(signUpError.message); return }
                if (!authData.user) { setInviteError("User creation failed"); return }

                // 2. Update profile with invite's organization
                const { error: profileError } = await supabase.from("profiles").upsert({
                    id: authData.user.id,
                    organization_id: inviteData.organization_id,
                    full_name: fullName,
                    role: inviteData.role || "member", // Use invited role
                })
                if (profileError) { setInviteError("Failed to update profile: " + profileError.message); return }

                // 3. Mark invite as accepted
                const { error: inviteUpdateError } = await supabase.from("invites").update({ status: "accepted" }).eq("invite_code", inviteCode)
                if (inviteUpdateError) logger.error("Invite update error:", inviteUpdateError)

                router.push("/")
            } catch (err) {
                logger.error("Signup with invite failed:", err)
                setInviteError(err instanceof Error ? err.message : "Signup failed")
            }
        } else {
            // New Org Signup
            try {
                const result = await signUp(email, password, fullName, orgName)
                if (result?.organization?.id) {
                    setCreatedOrgId(result.organization.id)
                    setStep("invite") // Move to step 2
                }
            } catch (err) {
                // Error handled by useAuth
            }
        }
    }

    // Handle Invites (Step 2)
    const handleInviteSubmit = async () => {
        // Collect valid emails and their corresponding roles
        const invitesToSend = inviteEmails.map((email, idx) => ({
            email: email.trim(),
            role: inviteRoles[idx]
        })).filter(i => i.email)

        if (!createdOrgId || !invitesToSend.length) {
            router.push("/")
            return
        }

        setLoadingInvite(true)
        try {
            // Send one by one or modify API to accept batch with roles? 
            // Current API takes `emails: string[]`. I need to change API or loop here.
            // Let's loop here for simplicity as API change for batch roles might be complex unless I change API to accept `invites: {email, role}[]`
            // Actually, `app/api/invite/route.ts` takes `email` (single) or `emails` (array). 
            // If I want distinct roles, I should probably just pick ONE role for all, or loop.
            // The prompt implies "assign roles", likely meaning "admin or member".
            // Let's assume for this bulk step, they are adding "Teammates", likely MEMBERS.
            // BUT user said "assign roles".
            // Let's just modify the UI to allow role selection and loop the API calls or update API.
            // Since API now takes `role`, but applies to ALL `emails`.
            // So I can't mix roles in one batch if I use `emails`.
            // Strategy: Group by role?
            // "emails" list is mapped to `role`.

            // Allow simplified "Default Role" for the batch, OR simple map.
            // Let's just iterate and call API for each unique email+role pair.

            const results = await Promise.all(invitesToSend.map(invite =>
                fetch("/api/invite", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: invite.email,
                        role: invite.role,
                        organizationId: createdOrgId,
                    }),
                }).then(res => res.json())
            ))

            // Check results
            const failed = results.filter(r => r.error)
            if (failed.length) {
                setInviteStatus(`Some invites failed. ${results.length - failed.length} sent.`)
                setLoadingInvite(false)
            } else {
                setInviteStatus(`Sent ${results.length} invite(s)`)
                router.push("/")
            }
        } catch (error) {
            logger.error("Invite send failed:", error)
            setInviteStatus("Failed to send invites")
            setLoadingInvite(false)
        }
    }

    if (step === "invite") {
        return (
            <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-8 text-center">
                    <div className="mb-6">
                        <div className="mx-auto h-12 w-12 bg-[var(--color-accent)]/10 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">👋</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[var(--color-fg-primary)] mb-2">
                            Invite your team
                        </h1>
                        <p className="text-[var(--color-fg-tertiary)]">
                            Work is better together. Invite your colleagues to <strong>{orgName}</strong>.
                        </p>
                    </div>

                    <div className="space-y-3 mb-6">
                        {inviteEmails.map((value, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    type="email"
                                    value={value}
                                    onChange={(e) => {
                                        const next = [...inviteEmails]
                                        next[idx] = e.target.value
                                        setInviteEmails(next)
                                    }}
                                    placeholder={`colleague${idx + 1}@example.com`}
                                    className="flex-1 px-4 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg text-[var(--color-fg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                                />
                                <input
                                    value={inviteRoles[idx]}
                                    onChange={(e) => {
                                        const next = [...inviteRoles]
                                        const val = e.target.value
                                        next[idx] = val.length > 0 ? val.charAt(0).toUpperCase() + val.slice(1) : ""
                                        setInviteRoles(next)
                                    }}
                                    placeholder="Role"
                                    className="w-32 px-4 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg text-[var(--color-fg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                                />
                            </div>
                        ))}
                    </div>

                    {/* ... rest of invite UI ... */}

                    {inviteStatus && (
                        <p className={`text-sm mb-4 ${inviteStatus.includes("Failed") ? "text-red-500" : "text-green-500"}`}>
                            {inviteStatus}
                        </p>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={handleInviteSubmit}
                            disabled={loadingInvite}
                            className="w-full py-3 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loadingInvite ? "Sending invites..." : "Send Invites"}
                        </button>
                        <button
                            onClick={() => router.push("/")}
                            disabled={loadingInvite}
                            className="w-full py-3 bg-transparent text-[var(--color-fg-secondary)] rounded-lg font-medium hover:text-[var(--color-fg-primary)] transition-colors"
                        >
                            Skip for now
                        </button>
                    </div>
                </Card>
            </div>
        )
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

                <form onSubmit={handleSignupSubmit} className="space-y-4">
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
                        {loading ? "Creating account..." : (inviteData ? "Join Team" : "Create Account")}
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
