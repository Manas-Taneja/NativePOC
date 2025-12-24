import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

type InviteRequest = {
  email?: string
  emails?: string[]
  organizationId: string
  role?: string
}

async function sendEmailInvite(recipient: string, inviteLink: string, htmlBody?: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    logger.warn("RESEND_API_KEY not configured; skipping email send", { recipient })
    return
  }

  const payload = {
    from: process.env.RESEND_FROM || "Native <onboarding@resend.dev>",
    to: [recipient],
    subject: "You’re invited to Native",
    html: htmlBody || `<p>You’ve been invited to join Native.</p><p><a href="${inviteLink}">Accept invite</a></p>`,
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
        baseUrl = vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`
      } else {
        const host = request.headers.get("host")
        // If host includes localhost, force http, otherwise https
        const protocol = host?.includes("localhost") ? "http" : "https"
        baseUrl = host ? `${protocol}://${host}` : "http://localhost:3000"
      }
    }
    baseUrl = baseUrl.replace(/\/$/, "")

    const results: Array<{ email: string; inviteLink?: string; error?: string }> = []

    for (const inviteEmail of inviteList) {
      // Check for recent invites (rate limit: 1 per 24h)
      const { data: existingInvite } = await supabase
        .from("invites")
        .select("created_at")
        .eq("organization_id", organizationId)
        .eq("email", inviteEmail)
        .gt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .single()

      if (existingInvite) {
        results.push({ email: inviteEmail, error: "Invite already sent in the last 24 hours" })
        continue
      }

      const inviteCode = crypto.randomUUID()
      const { error: inviteError } = await supabase
        .from("invites")
        .insert({
          organization_id: organizationId,
          email: inviteEmail,
          invite_code: inviteCode,
          invited_by: user.id,
          role: body.role || 'member',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })

      if (inviteError) {
        logger.error("Invite error:", inviteError)
        // Check for specific DB errors to help debugging in production
        if (inviteError.message.includes('column "role" of relation "invites" does not exist')) {
          results.push({
            email: inviteEmail,
            error: `Database Schema Error: The 'role' column is missing.`,
            // We'll catch this "requiresManual" flag in the UI to show the SQL fix
          })
          // Hack: throw to stop execution and return this specific error structure
          // But here we are in a loop. We should likely just return a special error for the whole batch if one fails this hard.
          return NextResponse.json({
            error: "Database Schema Error: Missing 'role' column.",
            requiresManual: true,
            sql: `DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invites' AND column_name = 'role') THEN
        ALTER TABLE invites ADD COLUMN role TEXT NOT NULL DEFAULT 'Member';
    END IF;
    ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_role_check;
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE invites ALTER COLUMN role SET DEFAULT 'Member';
    ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'Member';
END $$;`
          }, { status: 500 })
        }
        results.push({ email: inviteEmail, error: inviteError.message })
        continue
      }

      const inviteLink = `${baseUrl}/signup?invite=${inviteCode}`
      results.push({ email: inviteEmail, inviteLink })

      // Fire-and-forget email send
      const prettyHtml = `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #000; font-size: 24px; font-weight: 600;">Use Native</h1>
        </div>
        <div style="background: #f9f9f9; padding: 32px; border-radius: 12px; text-align: center;">
          <p style="font-size: 16px; margin-bottom: 24px;">You have been invited to join <strong>Native</strong>.</p>
          <a href="${inviteLink}" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 16px;">Accept Invite</a>
          <p style="margin-top: 24px; font-size: 14px; color: #666;">or copy this link: <br/><a href="${inviteLink}" style="color: #666;">${inviteLink}</a></p>
        </div>
      </div>
      `

      void sendEmailInvite(inviteEmail, inviteLink, prettyHtml)
    }

    const failed = results.filter((r) => r.error)
    const successCount = results.length - failed.length

    if (failed.length === results.length) {
      // If single invite failed, show the specific error
      const specificError = failed.length === 1 ? failed[0].error : "Failed to create invites"
      return NextResponse.json(
        {
          error: specificError,
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
