import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      )
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single()

    if (!profile?.organization_id) {
      return NextResponse.json(
        { error: { code: "NO_ORGANIZATION", message: "User not in an organization" } },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const type = url.searchParams.get("type")
    const impact = url.searchParams.get("impact")
    const team = url.searchParams.get("team")

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
      console.error("Error fetching insights:", fetchError)
      return NextResponse.json(
        { error: { code: "FETCH_ERROR", message: "Failed to fetch insights" } },
        { status: 500 }
      )
    }

    // Filter by team if specified (search in sources JSONB)
    let filtered = insights || []
    if (team) {
      filtered = filtered.filter((insight) => {
        const sources = insight.sources as Array<{ label: string; url: string; timestamp: string }>
        return sources.some((source) =>
          source.label.toLowerCase().includes(team.toLowerCase())
        )
      })
    }

    return NextResponse.json({ items: filtered })
  } catch (error) {
    console.error("Insights route error:", error)
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    )
  }
}


