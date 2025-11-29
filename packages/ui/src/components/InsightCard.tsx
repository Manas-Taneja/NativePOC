'use client';

import type { Insight } from "@native/types";
import { ReactNode } from "react";
import { Badge } from "./Badge";
import { GlassCard } from "./GlassCard";
import { Button } from "./Button";
import { motion } from "framer-motion";

const typeTone: Record<Insight["type"], "accent" | "warning" | "critical" | "info" | "muted"> = {
  decision: "accent",
  risk: "warning",
  blocker: "critical",
  trend: "info",
  summary: "muted"
};

type InsightCardProps = {
  insight: Insight;
  footer?: ReactNode;
};

export function InsightCard({ insight, footer }: InsightCardProps) {
  const tone = typeTone[insight.type];
  return (
    <GlassCard
      className="insight-card"
      title={
        <div className="insight-card__header">
          <Badge tone={tone}>{insight.type.toUpperCase()}</Badge>
          <span className="insight-card__confidence">{Math.round(insight.confidence * 100)}% confidence</span>
        </div>
      }
    >
      <motion.h3
        className="insight-card__title"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.05, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {insight.title}
      </motion.h3>
      <p className="insight-card__summary">{insight.summary}</p>
      <dl className="insight-card__meta">
        <div>
          <dt>Impact</dt>
          <dd>{insight.impact.toUpperCase()}</dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>{insight.owner}</dd>
        </div>
      </dl>
      <div className="insight-card__sources" aria-label="Sources">
        {insight.sources.map((source) => (
          <a key={source.url} href={source.url} className="insight-card__source-link">
            {source.label}
          </a>
        ))}
      </div>
      {insight.suggestedActions && insight.suggestedActions.length > 0 && (
        <div className="insight-card__actions">
          {insight.suggestedActions.map((action) => (
            <Button key={action.id} variant={action.intent ?? "ghost"}>
              {action.label}
            </Button>
          ))}
        </div>
      )}
      {footer}
    </GlassCard>
  );
}
