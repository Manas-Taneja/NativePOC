"use client"

import * as React from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Card } from "@/components/ui/card"

export default function LoginPage() {
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const { signIn, loading, error } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await signIn(email, password)
        } catch (err) {
            // Error is handled by useAuth hook
        }
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[var(--color-fg-primary)] mb-2">
                        Welcome to NativeIQ
                    </h1>
                    <p className="text-[var(--color-fg-tertiary)]">
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                            className="w-full px-4 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg text-[var(--color-fg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                            placeholder="you@example.com"
                        />
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
                            className="w-full px-4 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg text-[var(--color-fg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-[var(--color-fg-tertiary)]">
                    Don't have an account?{" "}
                    <Link
                        href="/signup"
                        className="text-[var(--color-accent)] hover:underline font-medium"
                    >
                        Sign up
                    </Link>
                </div>
            </Card>
        </div>
    )
}
