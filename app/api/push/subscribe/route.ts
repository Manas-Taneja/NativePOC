import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

type SubscriptionPayload = {
  subscription: PushSubscription
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required", details: {} } },
        { status: 401 },
      )
    }

    const body = (await request.json()) as SubscriptionPayload
    const { subscription } = body

    if (!subscription) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "subscription is required", details: {} } },
        { status: 400 },
      )
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single()

    if (!profile?.organization_id) {
      return NextResponse.json(
        { error: { code: "NO_ORGANIZATION", message: "User not in an organization", details: {} } },
        { status: 403 },
      )
    }

    const { error: upsertError } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        organization_id: profile.organization_id,
        endpoint: subscription.endpoint,
        subscription_json: subscription,
      },
      { onConflict: "endpoint" },
    )

    if (upsertError) {
      logger.error("Push subscription upsert error:", upsertError)
      return NextResponse.json(
        { error: { code: "UPSERT_ERROR", message: "Failed to save subscription", details: {} } },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Push subscription error:", error)
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to save subscription", details: {} } },
      { status: 500 },
    )
  }
}


