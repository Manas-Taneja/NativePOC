/**
 * Mock data for the dashboard
 */

export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  userName?: string  // For multi-user chat
  userAvatar?: string  // User initials or avatar
  author_id?: string | null
  author?: {
    full_name: string | null
    avatar_url: string | null
  }
}

export interface Metric {
  label: string
  value: string | number
  trend?: {
    direction: "up" | "down"
    percentage: number
  }
}

import type { Insight, SlaMetric } from "@native/types"
import { insights as insightSeed, slaMetrics as slaSeed } from "@/lib/server-data"

/**
 * Mock chat messages - Multi-person team conversation
 * Native (AI) responds only when triggered by keywords
 * Using timestamps relative to "now" but calculated at module load
 * This is consistent between server and client within the same render
 */
const now = Date.now()
const baseTimestamp = new Date(now)

export const mockMessages: Message[] = [
  {
    id: "1",
    content: "Anyone else still thinking about the breakfast tacos from yesterday’s standup? 🌮",
    role: "user",
    userName: "Jules Rivera",
    userAvatar: "JR",
    timestamp: new Date(baseTimestamp.getTime() - 420000),
  },
  {
    id: "2",
    content: "Totally. Also, whoever keeps switching the Spotify queue to lofi beats—thank you.",
    role: "user",
    userName: "Priya Patel",
    userAvatar: "PP",
    timestamp: new Date(baseTimestamp.getTime() - 405000),
  },
  {
    id: "3",
    content: "FYI I’ll be AFK for 30 mins to help facilities haul in the new desks. Ping if urgent.",
    role: "user",
    userName: "Luis Ortega",
    userAvatar: "LO",
    timestamp: new Date(baseTimestamp.getTime() - 390000),
  },
  {
    id: "4",
    content: "Native, quick gut check: are payments on track for the lunchtime promo or should we pause it?",
    role: "user",
    userName: "Priya Patel",
    userAvatar: "PP",
    timestamp: new Date(baseTimestamp.getTime() - 360000),
  },
  {
    id: "5",
    content: "Payments look stable—success rate 98.9% over the last hour and promo redemptions are trending +14% vs yesterday. Latency on Stripe Asia edged up 6%, but still under SLA. Keep the promo live and re-check in 20 minutes; I’ll alert you if error rate crosses 1.5%.",
    role: "assistant",
    timestamp: new Date(baseTimestamp.getTime() - 350000),
  },
]

type KeywordResponse = {
  keywords: string[]
  response: string
}

const keywordResponses: KeywordResponse[] = [
  {
    keywords: ["total revenue", "revenue"],
    response:
      "Total revenue is $125,430, up 12.5% versus yesterday. The uplift is driven by the lunchtime promo and higher premium-plan mix.",
  },
  {
    keywords: ["active users", "users", "active"],
    response:
      "Active users are at 2,847, climbing 8.3%. Engagement looks healthy—retention cohorts are holding steady across desktop and mobile.",
  },
  {
    keywords: ["conversion rate", "conversion", "checkout"],
    response:
      "Conversion rate is sitting at 3.24%, which is down 2.1%. Most of the slippage is coming from Safari mobile sessions during checkout.",
  },
  {
    keywords: ["premium plans", "premium"],
    response:
      "Premium plan signups are surging—up 18% today, primarily from organic search traffic tied to the new brand campaign you launched.",
  },
  {
    keywords: ["payment gateway", "gateway", "payment"],
    response:
      "Payment gateway errors ticked up to 4.2% for the last hour, which triggered the on-call alert. Engineering has the incident and mitigation is underway.",
  },
  {
    keywords: ["checkout flow optimization", "checkout flow", "a/b test"],
    response:
      "Recommend an A/B on the new checkout flow—conversion dipped 2.1% since deployment. Let’s isolate the new modal against the previous experience.",
  },
]

export function generateNativeResponse(query: string): string {
  const normalized = query.toLowerCase()
  const matched = keywordResponses.find(entry =>
    entry.keywords.some(keyword => normalized.includes(keyword))
  )

  if (matched) return matched.response

  return "Sorry, I don’t have information regarding that."
}

/**
 * Mock metrics for the overview
 */
export const mockMetrics: Metric[] = [
  {
    label: "Total Revenue",
    value: "$125,430",
    trend: { direction: "up", percentage: 12.5 },
  },
  {
    label: "Active Users",
    value: "2,847",
    trend: { direction: "up", percentage: 8.3 },
  },
  {
    label: "Conversion Rate",
    value: "3.24%",
    trend: { direction: "down", percentage: 2.1 },
  },
]

/**
 * Mock insights
 */
export const mockInsights: Insight[] = insightSeed

export interface Channel {
  id: string
  organizationId: string
  name: string
  description?: string | null
  type: "team" | "ai-assistant" | "direct"
}

export interface ChatMember {
  id: string
  fullName: string
  avatarUrl?: string | null
  role: "owner" | "admin" | "member"
}

export const mockChannels: Channel[] = [
  {
    id: "channel-ai",
    organizationId: "org-native",
    name: "Native Reports",
    description: "AI assistant briefings",
    type: "ai-assistant",
  },
  {
    id: "channel-team",
    organizationId: "org-native",
    name: "#gtm-squad",
    description: "Growth + GTM coordination",
    type: "team",
  },
  {
    id: "channel-direct",
    organizationId: "org-native",
    name: "Ops ↔ Finance",
    description: "Direct escalation lane",
    type: "direct",
  },
]

export const mockMembers: ChatMember[] = [
  { id: "member-1", fullName: "Priya Patel", role: "owner" },
  { id: "member-2", fullName: "Luis Ortega", role: "admin" },
  { id: "member-3", fullName: "Jules Rivera", role: "member" },
  { id: "member-4", fullName: "Alex Martinez", role: "member" },
  { id: "member-5", fullName: "Jordan Lee", role: "member" },
]

export const mockSlaMetrics: SlaMetric[] = slaSeed

