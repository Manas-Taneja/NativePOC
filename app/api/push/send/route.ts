import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import webpush from "web-push"

type PushBody = {
  userId?: string
  organizationId?: string
  title: string
  body: string
  url?: string
}

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com"

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys not configured")
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)
}

export async function POST(request: Request) {
  try {
    configureWebPush()

    const supabase = await createClient()
    const body = (await request.json()) as PushBody

    const { title, body: messageBody, url, userId, organizationId } = body
    if (!title || !messageBody) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "title and body are required", details: {} } },
        { status: 400 },
      )
    }

    // For now, allow server-side auth only; in production you might enforce stricter auth/roles
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required", details: {} } },
        { status: 401 },
      )
    }

    let query = supabase.from("push_subscriptions").select("subscription_json")

    if (userId) {
      query = query.eq("user_id", userId)
    } else if (organizationId) {
      query = query.eq("organization_id", organizationId)
    } else {
      query = query.eq("user_id", user.id)
    }

    const { data: subs, error } = await query

    if (error) {
      logger.error("Push subscriptions fetch error:", error)
      return NextResponse.json(
        { error: { code: "FETCH_ERROR", message: "Failed to load subscriptions", details: {} } },
        { status: 500 },
      )
    }

    if (!subs || !subs.length) {
      return NextResponse.json({ success: true, sent: 0 })
    }

    const payload = JSON.stringify({
      title,
      body: messageBody,
      url,
    })

    let sent = 0
    for (const row of subs) {
      const subscription = row.subscription_json as PushSubscription
      try {
        await webpush.sendNotification(subscription as any, payload)
        sent += 1
      } catch (err) {
        logger.warn("Push send error", err)
      }
    }

    return NextResponse.json({ success: true, sent })
  } catch (error) {
    logger.error("Push send error:", error)
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to send push notification", details: {} } },
      { status: 500 },
    )
  }
}


