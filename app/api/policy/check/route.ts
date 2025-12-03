import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

interface PolicyRequest {
  actor: string
  action: string
  resource: { type: string; id: string }
  context?: Record<string, unknown>
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

    // Get user's profile and role
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("id", user.id)
      .single()

    if (!profile?.organization_id) {
      return NextResponse.json(
        { error: { code: "NO_ORGANIZATION", message: "User not in an organization" } },
        { status: 403 }
      )
    }

    const body = (await request.json()) as PolicyRequest

    if (!body?.actor || !body?.action || !body?.resource?.id) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "actor, action, and resource are required", details: {} } },
        { status: 400 },
      )
    }

    // Role-based authorization logic
    let allow = false
    let rationale = ""

    const userRole = profile.role
    const action = body.action

    // Define permission rules
    if (action === "tasks.delete") {
      // Only owners and admins can delete tasks
      allow = userRole === "owner" || userRole === "admin"
      rationale = allow
        ? `User role '${userRole}' has permission to delete tasks`
        : `User role '${userRole}' does not have permission to delete tasks. Only owners and admins can delete.`
    } else if (action === "tasks.create" || action === "tasks.update") {
      // All authenticated users can create/update tasks
      allow = true
      rationale = "All organization members can create and update tasks"
    } else if (action === "insights.create" || action === "insights.update") {
      // All authenticated users can create/update insights
      allow = true
      rationale = "All organization members can create and update insights"
    } else if (action === "organization.update") {
      // Only owners can update organization settings
      allow = userRole === "owner"
      rationale = allow
        ? "User is organization owner"
        : "Only organization owners can update organization settings"
    } else if (action === "members.invite") {
      // Owners and admins can invite members
      allow = userRole === "owner" || userRole === "admin"
      rationale = allow
        ? `User role '${userRole}' can invite members`
        : "Only owners and admins can invite members"
    } else {
      // Default allow for other actions
      allow = true
      rationale = "Default policy allow for standard actions"
    }

    return NextResponse.json({
      allow,
      policy_id: allow ? "pol_allow_rbac" : "pol_deny_rbac",
      rationale,
      context: {
        ...body.context,
        user_role: userRole,
        action: action,
      },
    })
  } catch (error) {
    logger.error("Policy check error:", error)
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to evaluate policy", details: {} } },
      { status: 500 },
    )
  }
}

