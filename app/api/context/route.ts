import { NextResponse } from "next/server"
import { fetchOrgContext } from "@/lib/context"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    const context = await fetchOrgContext()
    if (!context) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required or organization missing", details: {} } },
        { status: 401 },
      )
    }

    return NextResponse.json({ context })
  } catch (error) {
    logger.error("Context fetch error:", error)
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch context", details: {} } },
      { status: 500 },
    )
  }
}



