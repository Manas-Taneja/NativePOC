import { createClient } from "@/lib/supabase/server"
import type { Insight, Task } from "@native/types"
import type { NextRequest } from "next/server"

export type OrgContext = {
  userId: string
  organizationId: string
  organizationName: string | null
  profile: {
    id: string
    full_name: string | null
    role: string | null
  }
  channels: Array<{
    id: string
    name: string
    description: string | null
    type: "team" | "ai-assistant" | "direct"
    metadata: Record<string, unknown> | null
  }>
  members: Array<{
    id: string
    full_name: string | null
    avatar_url: string | null
    role: string | null
  }>
  insights: Insight[]
  tasks: Task[]
}

export async function fetchOrgContext(_request?: NextRequest): Promise<OrgContext | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, organization_id, full_name, role")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id) return null

  const [{ data: organization }, { data: channels }, { data: members }, { data: insights }, { data: tasks }] =
    await Promise.all([
      supabase.from("organizations").select("name").eq("id", profile.organization_id).single(),
      supabase
        .from("channels")
        .select("id, name, description, type, metadata")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: true }),
      supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role")
        .eq("organization_id", profile.organization_id),
      supabase
        .from("insights")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("tasks")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false }),
    ])

  return {
    userId: user.id,
    organizationId: profile.organization_id,
    organizationName: organization?.name ?? null,
    profile: {
      id: profile.id,
      full_name: profile.full_name,
      role: profile.role,
    },
    channels: channels || [],
    members: members || [],
    insights: (insights as Insight[]) || [],
    tasks: (tasks as Task[]) || [],
  }
}



