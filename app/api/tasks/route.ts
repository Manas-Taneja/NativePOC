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
    const assignee = url.searchParams.get("assignee")
    const state = url.searchParams.get("state")

    // Build query
    let query = supabase
      .from("tasks")
      .select("*")
      .eq("organization_id", profile.organization_id)
      .order("created_at", { ascending: false })

    // Apply filters
    if (assignee && assignee !== "me") {
      query = query.eq("assignee", assignee)
    }
    if (state) {
      query = query.eq("state", state)
    }

    const { data: tasks, error: fetchError } = await query

    if (fetchError) {
      console.error("Error fetching tasks:", fetchError)
      return NextResponse.json(
        { error: { code: "FETCH_ERROR", message: "Failed to fetch tasks" } },
        { status: 500 }
      )
    }

    return NextResponse.json({ items: tasks || [] })
  } catch (error) {
    console.error("Tasks route error:", error)
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    )
  }
}


