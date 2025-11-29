import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const { email, organizationId } = await request.json()

        if (!email || !organizationId) {
            return NextResponse.json(
                { error: "Email and organization ID are required" },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Get the current user to verify they're an admin/owner
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify the user is part of this organization and has permission
        const { data: profile } = await supabase
            .from("profiles")
            .select("organization_id, role")
            .eq("id", user.id)
            .single()

        if (!profile || profile.organization_id !== organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        if (profile.role !== "owner" && profile.role !== "admin") {
            return NextResponse.json(
                { error: "Only owners and admins can invite members" },
                { status: 403 }
            )
        }

        // Create an invite record
        const inviteCode = crypto.randomUUID()
        const { error: inviteError } = await supabase
            .from("invites")
            .insert({
                organization_id: organizationId,
                email: email.toLowerCase(),
                invite_code: inviteCode,
                invited_by: user.id,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            })

        if (inviteError) {
            // If invites table doesn't exist, we'll handle it differently
            console.error("Invite error:", inviteError)
            return NextResponse.json(
                {
                    error: "Invites table not set up. User must sign up first, then you can add them.",
                    requiresManual: true,
                    sql: `UPDATE profiles SET organization_id = '${organizationId}' WHERE id = (SELECT id FROM auth.users WHERE email = '${email}');`
                },
                { status: 500 }
            )
        }

        // Generate invite link
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/signup?invite=${inviteCode}`

        return NextResponse.json({
            success: true,
            inviteLink,
            message: "Share this link with the user to join your organization",
        })
    } catch (error) {
        console.error("Invite error:", error)
        return NextResponse.json(
            { error: "Failed to create invite" },
            { status: 500 }
        )
    }
}
