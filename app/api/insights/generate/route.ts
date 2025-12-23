import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import type { Insight } from "@native/types"

const RISK_KEYWORDS = ["blocker", "blocked", "outage", "on fire", "downtime", "incident", "critical", "sev1"]
const DECISION_KEYWORDS = ["decision:", "we decided", "final call", "ship it", "go ahead", "approved"]
// Keep profit signal keywords tighter to avoid false positives on generic words like "up"
const PROFIT_KEYWORDS = [
  "profit",
  "profits",
  "revenue",
  "mrr",
  "growth",
  "improved",
  "accelerating",
  "velocity",
  "ahead of target",
]

export async function POST() {
  try {
    const supabase = await createClient()

    // Auth
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

    // Org lookup
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("organization_id, full_name")
      .eq("id", user.id)
      .single()

    if (profileError || !profile?.organization_id) {
      return NextResponse.json(
        { error: { code: "NO_ORGANIZATION", message: "User not in an organization", details: {} } },
        { status: 403 },
      )
    }

    const orgId = profile.organization_id

    // Fetch channels for this org (team only)
    const { data: channels, error: channelsError } = await supabase
      .from("channels")
      .select("id, name, organization_id, type")
      .eq("organization_id", orgId)

    if (channelsError) {
      logger.error("Error fetching channels for insights:", channelsError)
      return NextResponse.json(
        { error: { code: "FETCH_ERROR", message: "Failed to fetch channels", details: {} } },
        { status: 500 },
      )
    }

    const teamChannels = (channels || []).filter((c) => c.type === "team")
    const channelIds = teamChannels.map((c) => c.id)
    const channelCount = channelIds.length
    if (!channelCount) {
      return NextResponse.json({ created: 0, scanned: 0, channelCount: 0, messageCount: 0 })
    }

    const channelNameById = new Map<string, string | null>(
      teamChannels.map((c) => [c.id, c.name]),
    )

    // Fetch recent messages for this org's channels (last 24h, capped)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: messages, error: msgError } = await supabase
      .from("messages")
      .select("id, content, created_at, channel_id")
      .in("channel_id", channelIds)
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .limit(500)

    if (msgError) {
      logger.error("Error fetching messages for insights:", msgError)
      return NextResponse.json(
        { error: { code: "FETCH_ERROR", message: "Failed to fetch messages", details: {} } },
        { status: 500 },
      )
    }

    const messageCount = messages?.length || 0
    if (!messageCount) {
      return NextResponse.json({ created: 0, scanned: 0, channelCount, messageCount })
    }

    let created = 0

    for (const msg of messages) {
      const contentLower = msg.content.toLowerCase()
      const channelName = channelNameById.get(msg.channel_id) || "channel"

      // Ignore assistant-mention messages; they are prompts, not signals.
      if (/@native\b/i.test(msg.content)) continue

      const isRisk = RISK_KEYWORDS.some((kw) => contentLower.includes(kw))
      const isDecision = DECISION_KEYWORDS.some((kw) => contentLower.includes(kw))
      const isProfit = PROFIT_KEYWORDS.some((kw) => contentLower.includes(kw))

      const candidates: Array<Pick<Insight, "type" | "title" | "summary" | "confidence" | "impact">> = []

      if (isRisk) {
        candidates.push({
          type: "risk",
          title: `Potential risk in #${channelName}`,
          summary: truncate(msg.content, 280),
          confidence: 0.7,
          impact: "high",
        })
      }

      if (isDecision) {
        candidates.push({
          type: "decision",
          title: `Decision in #${channelName}`,
          summary: truncate(msg.content, 280),
          confidence: 0.8,
          impact: "medium",
        })
      }

      if (isProfit && !isRisk) {
        candidates.push({
          type: "trend",
          title: `Positive signal in #${channelName}`,
          summary: truncate(msg.content, 280),
          confidence: 0.8,
          impact: "low",
        })
      }

      // Option A: only messages that match one of the rule categories produce insights
      if (!candidates.length) continue

      const sources = [
        {
          label: `Message in #${channelName}`,
          url: `#messages:${msg.id}`,
          timestamp: msg.created_at,
          message_id: msg.id,
          channel: msg.channel_id,
        },
      ]

      const payloads = candidates.map((c) => ({
        organization_id: orgId,
        type: c.type,
        title: c.title,
        summary: c.summary,
        confidence: c.confidence,
        impact: c.impact,
        owner: profile.full_name || "System",
        sources,
        suggested_actions: [],
        user_role: null,
      }))

      const { error: insertError } = await supabase.from("insights").insert(payloads)
      if (insertError) {
        logger.error("Error inserting insights:", insertError)
        continue
      }

      created += payloads.length
    }

    return NextResponse.json({ created, scanned: messageCount, channelCount, messageCount })
  } catch (error) {
    logger.error("Insights generate error:", error)
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to generate insights", details: {} } },
      { status: 500 },
    )
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max - 3) + "..."
}


