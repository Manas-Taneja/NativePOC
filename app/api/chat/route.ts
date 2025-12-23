import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { createClient } from "@/lib/supabase/server"

type ChatRole = "user" | "assistant" | "system"

interface ChatMessage {
  role: ChatRole
  content: string
}

interface ChatRequest {
  message: string
  history?: ChatMessage[]
  systemPrompt?: string
}

const DEFAULT_SYSTEM_PROMPT = `You are Native, an AI assistant for NativeIQ.

Core Instructions:
- You have access to an "Organization Knowledge Base" (Context) containing facts about the user and their organization.
- USE THIS DATA as your source of truth.
- Address the user as "You". Do not use "I" or "My" to refer to the user's data. (Correct: "Your name is...", Incorrect: "My name is...").
- Keep answers concise and direct (under 80 words).`

const errorResponse = (status: number, code: string, message: string) =>
  NextResponse.json({ error: { code, message, details: {} } }, { status })

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest

    if (!body?.message?.trim()) {
      return errorResponse(400, "BAD_REQUEST", "Message is required")
    }

    if (!process.env.GEMINI_API_KEY) {
      return errorResponse(500, "SERVER_CONFIG", "Gemini API key not configured")
    }

    // Auth + org lookup (needed for context grounding)
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse(401, "UNAUTHORIZED", "Authentication required")
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, full_name")
      .eq("id", user.id)
      .single()

    const orgId = profile?.organization_id
    if (!orgId) {
      return errorResponse(403, "NO_ORGANIZATION", "User not in an organization")
    }

    // Fetch curated org context (updated infrequently) to reduce hallucinations
    // Fetch MORE items and ALL fields as requested to ensure nothing is missed
    const { data: contexts, error: contextError } = await supabase
      .from("contexts")
      .select("*")
      .eq("organization_id", orgId)
      .order("updated_at", { ascending: false })
      .limit(50) // Increased limit to ensure coverage

    if (contextError) {
      logger.warn("Context fetch error:", contextError)
    } else {
      logger.info(`Context fetched: ${contexts?.length} items found for org ${orgId}`)
      if (contexts?.length) {
        logger.info("Context titles:", contexts.map(c => c.title).join(", "))
      }
    }

    const contextBlock = (contexts || [])
      .map((c) => {
        const tags = c.tags && c.tags.length > 0 ? ` [Tags: ${c.tags.join(", ")}]` : ""
        return `Item: ${c.title}\nValue: ${c.content}${tags}`
      })
      .join("\n---\n")

    // Build conversation history
    const systemPrompt = body.systemPrompt?.trim() || DEFAULT_SYSTEM_PROMPT

    let conversationHistory = ""
    if (body.history && body.history.length > 0) {
      conversationHistory = body.history
        .map((msg) => {
          const role = msg.role === "assistant" ? "Model" : "User"
          return `${role}: ${msg.content}`
        })
        .join("\n\n")
    }

    // Debug backdoor to verify context availability
    const debugMode = body.message?.toLowerCase().includes("debug context")
    if (debugMode) {
      logger.info("Debug mode triggered, returning raw context")
      return NextResponse.json({
        message: `### Debug Context Output\n\n**Organization ID:** \`${orgId}\`\n**Items Found:** ${contexts?.length || 0}\n\n**Context Block:**\n\`\`\`text\n${contextBlock || "No context found"}\n\`\`\`\n\n**User Info:**\nID: ${user.id}\nName: ${profile?.full_name}`,
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      })
    }

    // Construct the prompt
    // Focusing STRICTLY on the Context Table as requested
    const fullPrompt = `${systemPrompt}

${contextBlock ? `Organization Knowledge Base (Strict Source of Truth):\n${contextBlock}\n\n` : ""}${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ""}User: ${body.message}

Model:`

    // Use Gemini REST API with available model
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`

    const geminiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }]
      })
    })

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json().catch(() => ({}))
      logger.error("Gemini API error:", geminiResponse.status, errorData)
      return errorResponse(
        geminiResponse.status,
        "GEMINI_ERROR",
        errorData.error?.message || `Gemini API returned ${geminiResponse.status}`
      )
    }

    const data = await geminiResponse.json()
    const responseMessage = data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I couldn't generate a response."

    return NextResponse.json({
      message: responseMessage,
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    })
  } catch (error) {
    logger.error("Chat route error:", error)

    if (error instanceof Error) {
      return errorResponse(500, "GEMINI_ERROR", error.message)
    }

    return errorResponse(500, "SERVER_ERROR", "Failed to process AI request")
  }
}

// Health/debug endpoint to avoid 405s on accidental GET
export async function GET() {
  return NextResponse.json({ status: "ok", method: "GET not supported; use POST" })
}

