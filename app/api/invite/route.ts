import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

type InviteRequest = {
  email?: string
  emails?: string[]
  organizationId: string
}

async function sendEmailInvite(recipient: string, inviteLink: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    logger.warn("RESEND_API_KEY not configured; skipping email send", { recipient })
    return
  }

  const payload = {
    from: "Native <noreply@native.app>",
    to: [recipient],
    subject: "You’re invited to Native",
    html: `<p>You’ve been invited to join Native.</p><p><a href="${inviteLink}">Accept invite</a></p>`,
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    logger.warn("Resend email failed", { status: response.status, text })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InviteRequest
    const { email, emails, organizationId } = body

    const inviteList = (emails && Array.isArray(emails) ? emails : email ? [email] : [])
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5)

    if (!organizationId || !inviteList.length) {
      return NextResponse.json(
        { error: "Emails (<=5) and organization ID are required" },
        { status: 400 },
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

    // Generate base URL once
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!baseUrl) {
      const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL
      if (vercelUrl) {
        baseUrl = `https://${vercelUrl}`
      } else {
        const host = request.headers.get("host")
        const protocol = host?.includes("localhost") ? "http" : "https"
        baseUrl = host ? `${protocol}://${host}` : "http://localhost:3000"
      }
    }
    baseUrl = baseUrl.replace(/\/$/, "")

    const results: Array<{ email: string; inviteLink?: string; error?: string }> = []

    for (const inviteEmail of inviteList) {
      const inviteCode = crypto.randomUUID()
      const { error: inviteError } = await supabase
        .from("invites")
        .insert({
          organization_id: organizationId,
          email: inviteEmail,
          invite_code: inviteCode,
          invited_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })

      if (inviteError) {
        logger.error("Invite error:", inviteError)
        results.push({ email: inviteEmail, error: inviteError.message })
        continue
      }

      const inviteLink = `${baseUrl}/signup?invite=${inviteCode}`
      results.push({ email: inviteEmail, inviteLink })

      // Fire-and-forget email send
      void sendEmailInvite(inviteEmail, inviteLink)
    }

    const failed = results.filter((r) => r.error)
    const successCount = results.length - failed.length

    if (failed.length === results.length) {
      return NextResponse.json(
        {
          error: "Failed to create invites",
          details: failed,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed,
      message: failed.length ? "Some invites failed" : "Invites created",
      results,
    })
  } catch (error) {
    logger.error("Invite error:", error)
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    )
  }
}
