export type InsightType = "decision" | "risk" | "blocker" | "trend" | "summary";

export type InsightSource = {
  label: string;
  url: string;
  timestamp: string;
  channel?: string;
};

export type Insight = {
  id: string;
  type: InsightType;
  title: string;
  summary: string;
  confidence: number; // 0..1
  impact: "critical" | "high" | "medium" | "low";
  owner: string;
  sources: InsightSource[];
  suggestedActions?: Array<{
    id: string;
    label: string;
    intent?: "primary" | "secondary" | "ghost";
  }>;
  userRole?: string; // Role of the user who triggered this insight
};

export type TaskState = "open" | "in_progress" | "done" | "blocked";

export type Task = {
  id: string;
  title: string;
  assignee: string;
  state: TaskState;
  dueAt?: string;
  priority: "p0" | "p1" | "p2";
  sourceInsightId?: string;
  slackPermalink?: string;
};

export type Approval = {
  id: string;
  summary: string;
  requester: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  slaMinutes: number;
};

export type SlaMetric = {
  label: string;
  value: number;
  target: number;
  unit: "ms" | "%" | "count" | "seconds" | "minutes" | "hours";
};

export type UserProfile = {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
};

export type CommandDescriptor = {
  id: string;
  name: string;
  description: string;
  shortcut?: string;
  mcpTool?: string;
};
