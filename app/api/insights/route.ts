import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import type { Insight } from "@native/types"

const error = (status: number, code: string, message: string) =>
  NextResponse.json({ error: { code, message } }, { status })

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return error(401, "UNAUTHORIZED", "Authentication required")
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single()

    if (!profile?.organization_id) {
      return error(403, "NO_ORGANIZATION", "User not in an organization")
    }

    const url = new URL(request.url)
    const type = url.searchParams.get("type")
    const impact = url.searchParams.get("impact")

    // Fetch team channels for this org to enforce visibility rules
    const { data: channels, error: channelsError } = await supabase
      .from("channels")
      .select("id, type")
      .eq("organization_id", profile.organization_id)

    if (channelsError) {
      logger.error("Error fetching channels for insights GET:", channelsError)
      return error(500, "FETCH_ERROR", "Failed to fetch channels")
    }

    const teamChannelIds = new Set((channels || []).filter((c) => c.type === "team").map((c) => c.id))

    // Build query
    let query = supabase
      .from("insights")
      .select("*")
      .eq("organization_id", profile.organization_id)
      .order("created_at", { ascending: false })

    // Apply filters
    if (type) {
      query = query.eq("type", type)
    }
    if (impact) {
      query = query.eq("impact", impact)
    }

    const { data: insights, error: fetchError } = await query

    if (fetchError) {
      logger.error("Error fetching insights:", fetchError)
      return error(500, "FETCH_ERROR", "Failed to fetch insights")
    }

    // Always filter to team-channel-originated insights using the stored source.channel
    const filtered = (insights || []).filter((insight) => {
      const sources = (insight.sources as Array<{ channel?: string }> | null) || []
      return sources.some((source) => source.channel && teamChannelIds.has(source.channel))
    })

    return NextResponse.json({ items: filtered })
  } catch (err) {
    logger.error("Insights route error:", err)
    return error(500, "SERVER_ERROR", "Internal server error")
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return error(401, "UNAUTHORIZED", "Authentication required")
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, full_name")
      .eq("id", user.id)
      .single()

    const orgId = profile?.organization_id
    if (!orgId) {
      return error(403, "NO_ORGANIZATION", "User not in an organization")
    }

    const body = await request.json().catch(() => ({}))
    const type = body?.type as Insight["type"]
    const impact = body?.impact as Insight["impact"]
    const title = typeof body?.title === "string" ? body.title.trim() : ""
    const summary = typeof body?.summary === "string" ? body.summary.trim() : ""
    const confidence = typeof body?.confidence === "number" ? body.confidence : 0.7
    const sources = Array.isArray(body?.sources) ? body.sources : []
    const suggestedActions = Array.isArray(body?.suggestedActions) ? body.suggestedActions : []
    const userRole = typeof body?.userRole === "string" ? body.userRole : null

    const validTypes: Insight["type"][] = ["decision", "risk", "blocker", "trend", "summary"]
    const validImpact: Insight["impact"][] = ["critical", "high", "medium", "low"]

    if (!validTypes.includes(type)) return error(400, "BAD_REQUEST", "Invalid type")
    if (!validImpact.includes(impact)) return error(400, "BAD_REQUEST", "Invalid impact")
    if (!title) return error(400, "BAD_REQUEST", "Title required")
    if (!summary) return error(400, "BAD_REQUEST", "Summary required")
    if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      return error(400, "BAD_REQUEST", "Confidence must be 0..1")
    }
    if (title.length > 300 || summary.length > 6000) {
      return error(400, "BAD_REQUEST", "Content too long")
    }
    if (sources.length > 5) return error(400, "BAD_REQUEST", "Too many sources")

    const safeSources = sources
      .filter((s: any) => s && typeof s === "object")
      .map((s: any) => ({
        label: String(s.label || "").slice(0, 120),
        url: String(s.url || "").slice(0, 500),
        timestamp: String(s.timestamp || ""),
        channel: s.channel ? String(s.channel) : undefined,
        message_id: s.message_id ? String(s.message_id) : undefined,
      }))

    const safeActions = suggestedActions
      .filter((a: any) => a && typeof a === "object")
      .map((a: any, idx: number) => ({
        id: String(a.id || `action-${idx}`),
        label: String(a.label || "").slice(0, 140),
        intent: a.intent === "primary" || a.intent === "ghost" ? a.intent : "secondary",
      }))

    const { data, error: insertError } = await supabase
      .from("insights")
      .insert({
        organization_id: orgId,
        type,
        title,
        summary,
        confidence,
        impact,
        owner: profile?.full_name || "System",
        sources: safeSources,
        suggested_actions: safeActions,
        user_role: userRole,
      })
      .select("*")
      .single()

    if (insertError) {
      logger.error("Insight insert error:", insertError)
      return error(500, "INSERT_ERROR", "Failed to create insight")
    }

    return NextResponse.json({ item: data })
  } catch (err) {
    logger.error("Insight POST error:", err)
    return error(500, "SERVER_ERROR", "Internal server error")
  }
}


