import webpush from "web-push"
import { logger } from "@/lib/logger"
import { SupabaseClient } from "@supabase/supabase-js"

export interface PushSubscription {
    endpoint: string
    keys: {
        p256dh: string
        auth: string
    }
}

export type PushNotificationPayload = {
    title: string
    body: string
    url?: string
    icon?: string
    tag?: string
    data?: Record<string, unknown>
}

let isConfigured = false

function configureWebPush() {
    if (isConfigured) return

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com"

    if (!publicKey || !privateKey) {
        logger.warn("VAPID keys not configured, push notifications will fail")
        return
    }

    webpush.setVapidDetails(subject, publicKey, privateKey)
    isConfigured = true
}

export async function sendPushNotification(
    subscription: PushSubscription,
    payload: PushNotificationPayload
) {
    configureWebPush()

    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload))
        return true
    } catch (error) {
        logger.error("Error sending push notification:", error)
        return false
    }
}

export async function sendPushToUser(
    supabase: SupabaseClient,
    userId: string,
    payload: PushNotificationPayload
) {
    const { data: subs, error } = await supabase
        .from("push_subscriptions")
        .select("subscription_json")
        .eq("user_id", userId)

    if (error) {
        logger.error("Failed to fetch user subscriptions:", error)
        return 0
    }

    if (!subs || subs.length === 0) return 0

    let sentCount = 0
    const promises = subs.map(async (row) => {
        const sub = row.subscription_json as PushSubscription
        const success = await sendPushNotification(sub, payload)
        if (success) sentCount++
    })

    await Promise.all(promises)
    return sentCount
}

export async function sendPushToOrganization(
    supabase: SupabaseClient,
    organizationId: string,
    payload: PushNotificationPayload,
    excludeUserId?: string
) {
    let query = supabase
        .from("push_subscriptions")
        .select("user_id, subscription_json")
        .eq("organization_id", organizationId)

    if (excludeUserId) {
        query = query.neq("user_id", excludeUserId)
    }

    const { data: subs, error } = await query

    if (error) {
        logger.error("Failed to fetch org subscriptions:", error)
        return 0
    }

    if (!subs || subs.length === 0) return 0

    let sentCount = 0
    const promises = subs.map(async (row) => {
        const sub = row.subscription_json as PushSubscription
        const success = await sendPushNotification(sub, payload)
        if (success) sentCount++
    })

    await Promise.all(promises)
    return sentCount
}
