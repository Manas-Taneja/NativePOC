import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import { sendPushToOrganization, sendPushToUser } from "@/lib/push-service"

// Define input type
type SendMessageBody = {
    channelId: string
    content: string
    replyToId?: string
    isAI?: boolean // Should usually be false for user calls, but kept for parity
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // 1. Authenticate User
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
                { status: 401 }
            )
        }

        // 2. Parse Body
        const body = (await request.json()) as SendMessageBody
        const { channelId, content, replyToId } = body

        if (!channelId || !content?.trim()) {
            return NextResponse.json(
                { error: { code: "BAD_REQUEST", message: "channelId and content are required" } },
                { status: 400 }
            )
        }

        // 3. Verify Channel Access & Membership
        // (RLS might handle insertion, but we need details for push)
        const { data: channel, error: channelError } = await supabase
            .from("channels")
            .select("id, name, type, organization_id, metadata")
            .eq("id", channelId)
            .single()

        if (channelError || !channel) {
            return NextResponse.json(
                { error: { code: "NOT_FOUND", message: "Channel not found" } },
                { status: 404 }
            )
        }

        // 4. Insert Message
        const metadata: Record<string, unknown> = {}
        if (replyToId) metadata.reply_to_id = replyToId

        const { data: message, error: insertError } = await supabase
            .from("messages")
            .insert({
                channel_id: channelId,
                author_id: user.id,
                content: content.trim(),
                is_ai_response: false,
                metadata,
            })
            .select(`
          *,
          author:profiles!author_id (
            id,
            full_name,
            avatar_url
          )
        `)
            .single()

        if (insertError) {
            logger.error("Message insert failed:", insertError)
            return NextResponse.json(
                { error: { code: "INSERT_ERROR", message: "Failed to save message" } },
                { status: 500 }
            )
        }

        // 5. Trigger Push Notification (Async - don't block response)
        // We don't await this to keep the UI snappy
        (async () => {
            try {
                const title = channel.type === 'direct'
                    ? `New message from ${message.author?.full_name || 'Someone'}`
                    : `#${channel.name}`

                const pushPayload = {
                    title,
                    body: content.length > 100 ? content.substring(0, 100) + "..." : content,
                    url: "/", // Should probably link to deep channel URL eventually
                    tag: `channel-${channelId}`,
                    data: {
                        channelId,
                        messageId: message.id
                    }
                }

                if (channel.type === "direct") {
                    // For DM: Send only to other participants
                    const participants = channel.metadata?.participants || []
                    const otherUsers = participants.filter((uid: string) => uid !== user.id)

                    for (const recipientId of otherUsers) {
                        await sendPushToUser(supabase, recipientId, pushPayload)
                    }
                } else {
                    // For Team: Send to org members (excluding sender)
                    // ideally we'd filter by channel membership if that existed
                    // Assuming org-wide channels for now
                    await sendPushToOrganization(supabase, channel.organization_id, pushPayload, user.id)
                }
            } catch (err) {
                logger.error("Background push notification failed:", err)
            }
        })()

        return NextResponse.json(message)

    } catch (error) {
        logger.error("Message send API error:", error)
        return NextResponse.json(
            { error: { code: "SERVER_ERROR", message: "Internal server error" } },
            { status: 500 }
        )
    }
}
