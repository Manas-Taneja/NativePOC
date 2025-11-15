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
}

export interface Metric {
  label: string
  value: string | number
  trend?: {
    direction: "up" | "down"
    percentage: number
  }
}

export interface Insight {
  id: string
  title: string
  description: string
  type: "alert" | "suggestion" | "info"
  timestamp: Date
}

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
    content: "Hey team, just pushed the new checkout flow to production 🚀",
    role: "user",
    userName: "Sarah Chen",
    userAvatar: "SC",
    timestamp: new Date(baseTimestamp.getTime() - 420000), // 7 min ago
  },
  {
    id: "2",
    content: "Nice! I'll keep an eye on the conversion metrics",
    role: "user",
    userName: "Mike Torres",
    userAvatar: "MT",
    timestamp: new Date(baseTimestamp.getTime() - 410000),
  },
  {
    id: "3",
    content: "Looks good so far. Traffic is picking up nicely 📈",
    role: "user",
    userName: "Sarah Chen",
    userAvatar: "SC",
    timestamp: new Date(baseTimestamp.getTime() - 380000),
  },
  {
    id: "4",
    content: "@Native can you give us an update on today's performance?",
    role: "user",
    userName: "Alex Kim",
    userAvatar: "AK",
    timestamp: new Date(baseTimestamp.getTime() - 300000), // 5 min ago
  },
  {
    id: "5",
    content: "Of course! Today's looking great overall. Revenue is up 12.5% compared to yesterday, driven primarily by strong conversion rates in the afternoon. Your active user count increased by 8.3%, which is excellent momentum.\n\nHowever, I noticed your conversion rate dipped slightly to 3.24% (down 2.1%). This might be worth investigating - could be related to the checkout flow updates Sarah just deployed.",
    role: "assistant",
    timestamp: new Date(baseTimestamp.getTime() - 290000),
  },
  {
    id: "6",
    content: "Hmm, that conversion dip is concerning. Any ideas what's causing it?",
    role: "user",
    userName: "Mike Torres",
    userAvatar: "MT",
    timestamp: new Date(baseTimestamp.getTime() - 270000),
  },
  {
    id: "7",
    content: "Could be the new payment modal? Users might be confused by the layout",
    role: "user",
    userName: "Sarah Chen",
    userAvatar: "SC",
    timestamp: new Date(baseTimestamp.getTime() - 250000),
  },
  {
    id: "8",
    content: "Native, what do you recommend we focus on?",
    role: "user",
    userName: "Alex Kim",
    userAvatar: "AK",
    timestamp: new Date(baseTimestamp.getTime() - 230000),
  },
  {
    id: "9",
    content: "Based on the data, here are my top 3 recommendations:\n\n1. Run an A/B test - Compare the new checkout flow vs the old one. The timing of the conversion dip (right after Sarah's deploy) suggests correlation.\n\n2. Check mobile specifically - 68% of the drop is from mobile users. The new modal might have responsive design issues.\n\n3. Monitor next 2 hours - If the trend continues, consider a quick rollback while we investigate.\n\nWant me to set up the A/B test automatically?",
    role: "assistant",
    timestamp: new Date(baseTimestamp.getTime() - 220000),
  },
  {
    id: "10",
    content: "Good catch on mobile! I'll check the responsive design right now",
    role: "user",
    userName: "Sarah Chen",
    userAvatar: "SC",
    timestamp: new Date(baseTimestamp.getTime() - 180000),
  },
  {
    id: "11",
    content: "I'm seeing some console errors on mobile Safari. Working on a fix 🔧",
    role: "user",
    userName: "Sarah Chen",
    userAvatar: "SC",
    timestamp: new Date(baseTimestamp.getTime() - 120000), // 2 min ago
  },
  {
    id: "12",
    content: "Native update: are there any urgent issues right now?",
    role: "user",
    userName: "Alex Kim",
    userAvatar: "AK",
    timestamp: new Date(baseTimestamp.getTime() - 60000), // 1 min ago
  },
  {
    id: "13",
    content: "Yes, I have one urgent item:\n\n🚨 Payment Gateway Alert - There's an elevated error rate (4.2% vs normal 0.8%) in payment processing over the last hour. This is likely contributing to the conversion drop Sarah mentioned.\n\nI've already notified the engineering team and created a ticket. The errors are specific to Safari mobile, which aligns with Sarah's findings.\n\nOther than that, everything else is running smoothly. Your SLA compliance is at 98.7% across all services.",
    role: "assistant",
    timestamp: new Date(baseTimestamp.getTime() - 50000),
  },
]

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
export const mockInsights: Insight[] = [
  {
    id: "1",
    title: "Premium Plans Surge",
    description: "Premium plan signups increased 18% today, primarily from organic search traffic.",
    type: "info",
    timestamp: new Date(baseTimestamp.getTime() - 120000),
  },
  {
    id: "2",
    title: "Payment Gateway Issues",
    description: "Elevated error rate detected in payment processing. Engineering team notified.",
    type: "alert",
    timestamp: new Date(baseTimestamp.getTime() - 50000),
  },
  {
    id: "3",
    title: "Checkout Flow Optimization",
    description: "Consider A/B testing the new checkout flow - conversion rate dipped 2.1% since deployment.",
    type: "suggestion",
    timestamp: new Date(baseTimestamp.getTime() - 180000),
  },
]

