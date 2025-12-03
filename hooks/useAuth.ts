"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"

export interface Profile {
    id: string
    organization_id: string | null
    full_name: string | null
    avatar_url: string | null
    role: "owner" | "admin" | "member"
    created_at: string
}

export interface Organization {
    id: string
    name: string
    slug: string
    created_at: string
}

export function useAuth() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function signUp(email: string, password: string, fullName: string, orgName: string) {
        setLoading(true)
        setError(null)

        try {
            // Create the user account
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            })

            if (authError) throw authError
            if (!authData.user) throw new Error("User creation failed")

            // Create organization
            const slug = orgName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "")

            const { data: orgData, error: orgError } = await supabase
                .from("organizations")
                .insert({ name: orgName, slug: `${slug}-${Date.now()}` })
                .select()
                .single()

            if (orgError) throw orgError

            // Update profile with organization and role
            const { error: profileError } = await supabase
                .from("profiles")
                .update({
                    organization_id: orgData.id,
                    role: "owner",
                })
                .eq("id", authData.user.id)

            if (profileError) throw profileError

            // Create default AI assistant channel
            const { error: channelError } = await supabase.from("channels").insert({
                organization_id: orgData.id,
                name: "AI Assistant",
                description: "Chat with Native AI for insights and assistance",
                type: "ai-assistant",
            })

            if (channelError) {
                logger.error("Failed to create AI channel:", channelError)
                // Don't throw - channel creation is not critical for signup
            }

            router.push("/")
            return { user: authData.user, organization: orgData }
        } catch (e) {
            const message = e instanceof Error ? e.message : "Signup failed"
            setError(message)
            throw e
        } finally {
            setLoading(false)
        }
    }

    async function signIn(email: string, password: string) {
        setLoading(true)
        setError(null)

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) throw authError

            router.push("/")
            return data
        } catch (e) {
            const message = e instanceof Error ? e.message : "Login failed"
            setError(message)
            throw e
        } finally {
            setLoading(false)
        }
    }

    async function signOut() {
        setLoading(true)
        setError(null)

        try {
            const { error: authError } = await supabase.auth.signOut()
            if (authError) throw authError

            router.push("/login")
        } catch (e) {
            const message = e instanceof Error ? e.message : "Logout failed"
            setError(message)
            throw e
        } finally {
            setLoading(false)
        }
    }

    async function fetchProfile(): Promise<Profile | null> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()

        if (profileError) {
            logger.error("Error fetching profile:", profileError)
            return null
        }

        return data
    }

    async function fetchOrganization(organizationId: string): Promise<Organization | null> {
        const { data, error: orgError } = await supabase
            .from("organizations")
            .select("*")
            .eq("id", organizationId)
            .single()

        if (orgError) {
            logger.error("Error fetching organization:", orgError)
            return null
        }

        return data
    }

    return {
        loading,
        error,
        signUp,
        signIn,
        signOut,
        fetchProfile,
        fetchOrganization,
    }
}
