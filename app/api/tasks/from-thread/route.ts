import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

interface ThreadTaskRequest {
  channel: string
  thread_ts: string
}

export async function POST(request: Request) {
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

    const body = (await request.json()) as ThreadTaskRequest

    if (!body?.channel || !body?.thread_ts) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "channel and thread_ts are required", details: {} } },
        { status: 400 },
      )
    }

    // Create task in database
    const { data: task, error: insertError } = await supabase
      .from("tasks")
      .insert({
        organization_id: profile.organization_id,
        title: `Follow up on thread ${body.thread_ts}`,
        assignee: "Unassigned",
        state: "open",
        due_at: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
        priority: "p1",
        slack_permalink: `https://slack.com/app_redirect?channel=${body.channel}&thread_ts=${body.thread_ts}`,
      })
      .select()
      .single()

    if (insertError) {
      logger.error("Error creating task:", insertError)
      return NextResponse.json(
        { error: { code: "CREATE_ERROR", message: "Failed to create task" } },
        { status: 500 }
      )
    }

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    logger.error("Task creation error:", error)
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to create task", details: {} } },
      { status: 500 },
    )
  }
}

