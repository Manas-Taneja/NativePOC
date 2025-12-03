import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

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

const DEFAULT_SYSTEM_PROMPT = `You are Native, an intelligent AI assistant for NativeIQ.
You help team members with:
- Summarizing discussions and decisions
- Identifying action items and tasks
- Analyzing business metrics and trends
- Providing insights on team communication
- Answering questions about the organization's data

Be concise, helpful, and professional. When providing recommendations, explain your reasoning.
Respond in a friendly but professional tone. Use bullet points and structured formatting when appropriate.`

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

    // Construct the prompt
    const fullPrompt = `${systemPrompt}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ""}User: ${body.message}

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

