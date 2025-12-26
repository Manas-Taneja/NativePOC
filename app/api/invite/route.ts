import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import nodemailer from "nodemailer"

type InviteRequest = {
  email?: string
  emails?: string[]
  organizationId: string
  role?: string
}

async function sendEmailInvite(recipient: string, inviteLink: string, htmlBody?: string) {
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com"
  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10)

  if (!smtpUser || !smtpPass) {
    logger.warn("SMTP credentials (SMTP_USER/SMTP_PASS) not configured; skipping email send", { recipient })
    return
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Native" <${smtpUser}>`,
      to: recipient,
      subject: "You’re invited to Native",
      html: htmlBody || `<p>You’ve been invited to join Native.</p><p><a href="${inviteLink}">Accept invite</a></p>`,
    })

    logger.info("Invite email sent via SMTP", { messageId: info.messageId, recipient })
  } catch (error) {
    logger.error("SMTP email send failed", { error, recipient })
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

    // Fetch organization name
    const { data: orgData } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organizationId)
      .single()
    const orgName = orgData?.name || "the team"

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
      const logoUrl = `${baseUrl}/NativeLogo.png`

      // Branded HTML Email Template
      const prettyHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f3f5; margin: 0; padding: 40px 20px;">
          <div style="background-color: #ffffff; max-width: 480px; margin: 0 auto; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); overflow: hidden;">
            
            <div style="background-color: #f8f9fa; padding: 32px 0 24px; text-align: center; border-bottom: 1px solid #f1f3f5;">
               <img src="${logoUrl}" alt="Native" width="48" height="48" style="display: inline-block; border-radius: 8px;">
            </div>

            <div style="padding: 40px 32px; text-align: center;">
              <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 16px; letter-spacing: -0.5px;">You've been invited</h1>
              <p style="color: #525252; font-size: 16px; line-height: 1.6; margin: 0 0 32px;">
                You have been invited to join <strong>${orgName}</strong> on <strong>Native</strong>. 
                Collaborate, chat, and track metrics in one place.
              </p>
              
              <a href="${inviteLink}" style="display: inline-block; background-color: #1a6391; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; transition: opacity 0.2s;">
                Accept Invite
              </a>

              <p style="margin-top: 32px; font-size: 13px; color: #a1a1a1;">
                Or copy this link: <br/>
                <a href="${inviteLink}" style="color: #1a6391; text-decoration: none; word-break: break-all;">${inviteLink}</a>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 24px;">
            <p style="color: #a1a1a1; font-size: 12px; margin: 0;">Sent via Native</p>
          </div>
        </body>
      </html>
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
