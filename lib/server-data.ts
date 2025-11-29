import type { Approval, Insight, SlaMetric, Task } from "@native/types"

export const insights: Insight[] = [
  {
    id: "insight-ops-001",
    type: "decision",
    title: "Customer onboarding needs simplification",
    summary:
      "Lost 3 trial customers this week citing complex onboarding. Consider creating a simplified setup flow or video tutorials to reduce friction.",
    confidence: 0.89,
    impact: "high",
    owner: "Operations Lead",
    sources: [
      {
        label: "Customer feedback survey",
        url: "#customer-feedback",
        timestamp: new Date().toISOString(),
      },
      {
        label: "Support ticket analysis",
        url: "#support-tickets",
        timestamp: new Date().toISOString(),
      },
    ],
    suggestedActions: [
      { id: "action-simplify", label: "Create Simple Flow", intent: "primary" },
      { id: "action-video", label: "Record Tutorial" },
    ],
  },
  {
    id: "insight-risk-014",
    type: "risk",
    title: "TechStart renewal at risk - 30% of MRR",
    summary:
      "Major client requesting 40% discount to match competitor pricing. Need to decide on retention strategy vs. letting them churn.",
    confidence: 0.92,
    impact: "critical",
    owner: "Founder & CEO",
    sources: [
      {
        label: "Sales conversation notes",
        url: "#sales-notes",
        timestamp: new Date().toISOString(),
      },
    ],
    suggestedActions: [
      { id: "action-negotiate", label: "Counter Offer", intent: "primary" },
      { id: "action-value", label: "Present Value Prop" },
    ],
  },
  {
    id: "insight-summary-022",
    type: "summary",
    title: "Cash flow concerns need attention",
    summary:
      "Current burn rate gives us 3.2 months runway. Need to focus on revenue growth or cost reduction to extend runway.",
    confidence: 0.85,
    impact: "high",
    owner: "Finance Lead",
    sources: [
      {
        label: "Financial dashboard",
        url: "#financials",
        timestamp: new Date().toISOString(),
      },
    ],
  },
]

export const tasks: Task[] = [
  {
    id: "task-001",
    title: "Negotiate TechStart renewal terms",
    assignee: "Jordan Lee",
    state: "in_progress",
    dueAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    priority: "p0",
    sourceInsightId: "insight-risk-014",
    slackPermalink: "#sales-channel",
  },
  {
    id: "task-002",
    title: "Create simplified onboarding flow",
    assignee: "Taylor Brooks",
    state: "open",
    dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    priority: "p1",
    sourceInsightId: "insight-ops-001",
  },
  {
    id: "task-003",
    title: "Review monthly expenses for cost cuts",
    assignee: "Alex Martinez",
    state: "open",
    dueAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    priority: "p0",
    sourceInsightId: "insight-summary-022",
  },
]

export const approvals: Approval[] = [
  {
    id: "approval-1001",
    summary: "Emergency marketing spend for lead gen",
    requester: "Jordan Lee",
    requestedAt: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
    status: "pending",
    slaMinutes: 60,
  },
  {
    id: "approval-1002",
    summary: "Part-time customer support hire",
    requester: "Taylor Brooks",
    requestedAt: new Date(Date.now() - 1000 * 60 * 82).toISOString(),
    status: "pending",
    slaMinutes: 120,
  },
]

export const slaMetrics: SlaMetric[] = [
  { label: "Customer response time", value: 4.2, target: 2, unit: "hours" },
  { label: "Monthly churn rate", value: 0.08, target: 0.05, unit: "%" },
  { label: "Trial conversion rate", value: 0.18, target: 0.25, unit: "%" },
]

