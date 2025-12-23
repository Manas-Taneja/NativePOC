import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

const error = (status: number, code: string, message: string) =>
  NextResponse.json({ error: { code, message } }, { status })

const MAX_CONTENT_LEN = 6000
const MAX_TITLE_LEN = 200
const MAX_TAGS = 10
const MAX_TAG_LEN = 40

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) return error(401, "UNAUTHORIZED", "Authentication required")

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single()

    const orgId = profile?.organization_id
    if (!orgId) return error(403, "NO_ORGANIZATION", "User not in an organization")

    const { data, error: fetchError } = await supabase
      .from("contexts")
      .select("*")
      .eq("organization_id", orgId)
      .order("updated_at", { ascending: false })
      .limit(50)

    if (fetchError) {
      logger.error("Context fetch error:", fetchError)
      return error(500, "FETCH_ERROR", "Failed to fetch context")
    }

    return NextResponse.json({ items: data || [] })
  } catch (err) {
    logger.error("Context GET error:", err)
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

    if (authError || !user) return error(401, "UNAUTHORIZED", "Authentication required")

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, full_name")
      .eq("id", user.id)
      .single()

    const orgId = profile?.organization_id
    if (!orgId) return error(403, "NO_ORGANIZATION", "User not in an organization")

    const body = await request.json().catch(() => null)
    const title = typeof body?.title === "string" ? body.title.trim() : ""
    const content = typeof body?.content === "string" ? body.content.trim() : ""
    const tags = Array.isArray(body?.tags) ? body.tags : []

    if (!title) return error(400, "BAD_REQUEST", "Title is required")
    if (!content) return error(400, "BAD_REQUEST", "Content is required")
    if (title.length > MAX_TITLE_LEN) return error(400, "BAD_REQUEST", "Title too long")
    if (content.length > MAX_CONTENT_LEN) return error(400, "BAD_REQUEST", "Content too long")
    if (tags.length > MAX_TAGS) return error(400, "BAD_REQUEST", "Too many tags")
    if (tags.some((t: any) => typeof t !== "string" || t.length > MAX_TAG_LEN)) {
      return error(400, "BAD_REQUEST", "Invalid tags")
    }

    const { data, error: insertError } = await supabase
      .from("contexts")
      .insert({
        organization_id: orgId,
        title,
        content,
        tags,
        updated_by: user.id,
      })
      .select("*")
      .single()

    if (insertError) {
      logger.error("Context insert error:", insertError)
      return error(500, "INSERT_ERROR", "Failed to save context")
    }

    return NextResponse.json({ item: data })
  } catch (err) {
    logger.error("Context POST error:", err)
    return error(500, "SERVER_ERROR", "Internal server error")
  }
}

