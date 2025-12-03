"use client"

import type { Insight, SlaMetric } from "@native/types"
import { cn } from "@/lib/utils"

type BusinessInsightsProps = {
  company?: string
  insights: Insight[]
  metrics: SlaMetric[]
}

const pickHighlightMetric = (metrics: SlaMetric[]) =>
  [...metrics].sort((a, b) => Math.abs(b.value - b.target) - Math.abs(a.value - a.target))[0]

const findInsight = (insights: Insight[], predicate: (insight: Insight) => boolean) =>
  insights.find(predicate)

export function BusinessInsights({ company = "Native", insights, metrics }: BusinessInsightsProps) {
  const highlightMetric = pickHighlightMetric(metrics)
  const topRisk = findInsight(insights, (insight) => insight.impact === "critical" || insight.type === "risk")
  const trending = findInsight(insights, (insight) => insight.type === "trend" || insight.type === "summary")
  const decision = findInsight(insights, (insight) => insight.type === "decision")

  const cards = [
    {
      id: "card-risks",
      label: "Risk Radar",
      title: topRisk?.title ?? "No blockers detected",
      detail:
        topRisk?.summary ??
        "Native is not tracking active blockers right now. Keep an eye on finance + GTM velocity for early signals.",
      accent: "risk",
    },
    {
      id: "card-growth",
      label: "Growth Pulse",
      title: trending?.title ?? "Momentum steady",
      detail:
        trending?.summary ?? "Acquisition is stable this week. Use this calm cycle to tidy onboarding experiments.",
      accent: "growth",
    },
    {
      id: "card-experiment",
      label: "Next Move",
      title: decision?.title ?? "Put experimentation on autopilot",
      detail:
        decision?.summary ?? "Queue two small experiments touching activation & retention. Native can auto-score them.",
      accent: "focus",
    },
    {
      id: "card-metric",
      label: highlightMetric ? highlightMetric.label : "Service Level",
      title: highlightMetric
        ? `${highlightMetric.value}${highlightMetric.unit} vs ${highlightMetric.target}${highlightMetric.unit}`
        : "No SLA variance",
      detail:
        highlightMetric && highlightMetric.value > highlightMetric.target
          ? "Performance slipped past target. Native suggests reinforcing the owning pod with a health stand-up."
          : "You're beating target. Document what worked and ship it to the playbook.",
      accent: highlightMetric && highlightMetric.value > highlightMetric.target ? "risk" : "growth",
    },
  ]

  return (
    <section className="card-surface section-block border border-[var(--color-border-subtle)] rounded-2xl bg-[var(--color-bg-elevated)] p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-fg-tertiary)]">Business Insights</p>
          <h3 className="text-2xl font-semibold text-[var(--color-fg-primary)] mt-2 font-heading tracking-wide">
            One-screen pulse for {company}
          </h3>
        </div>
        <button
          type="button"
          className="px-4 py-2 rounded-full border border-[var(--color-border-subtle)] text-sm text-[var(--color-fg-secondary)] hover:text-[var(--color-fg-primary)] hover:border-[var(--color-fg-primary)] transition-colors"
        >
          Download briefing
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((card) => {
          const accentColors = {
            risk: "border-l-4 border-l-[var(--color-error)] bg-gradient-to-r from-[var(--color-error)]/5 to-transparent",
            growth: "border-l-4 border-l-[var(--color-success)] bg-gradient-to-r from-[var(--color-success)]/5 to-transparent",
            focus: "border-l-4 border-l-[var(--color-accent-secondary)] bg-gradient-to-r from-[var(--color-accent-secondary)]/5 to-transparent",
          }
          const accentClass = accentColors[card.accent as keyof typeof accentColors] || ""
          const labelColors = {
            risk: "text-[var(--color-error)]",
            growth: "text-[var(--color-success)]",
            focus: "text-[var(--color-accent-secondary)]",
          }
          const labelClass = labelColors[card.accent as keyof typeof labelColors] || "text-[var(--color-fg-tertiary)]"
          return (
            <article
              key={card.id}
              className={cn("rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-3 space-y-1.5", accentClass)}
            >
              <span className={cn("text-xs uppercase tracking-[0.3em] font-semibold", labelClass)}>{card.label}</span>
              <h4 className="text-lg font-semibold text-[var(--color-fg-primary)] font-heading tracking-wide">{card.title}</h4>
              <p className="text-sm text-[var(--color-fg-secondary)] leading-relaxed">{card.detail}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

