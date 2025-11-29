'use client';

import { clsx } from "clsx";
import type { ReactNode } from "react";

type BadgeTone = "accent" | "muted" | "positive" | "warning" | "critical" | "info";

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
};

const toneClassMap: Record<BadgeTone, string> = {
  accent: "badge--accent",
  muted: "badge--muted",
  positive: "badge--positive",
  warning: "badge--warning",
  critical: "badge--critical",
  info: "badge--info"
};

export function Badge({ children, tone = "muted", icon, className }: BadgeProps) {
  return (
    <span className={clsx("badge", toneClassMap[tone], className)}>
      {icon && <span className="badge__icon" aria-hidden>{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
