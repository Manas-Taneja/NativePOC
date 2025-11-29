'use client';

import { clsx } from "clsx";
import { ReactNode } from "react";

export type MetricIntent = "primary" | "neutral" | "positive" | "warning" | "danger";

type MetricTileProps = {
  label: string;
  value: string | number;
  delta?: string;
  intent?: MetricIntent;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
};

const intentClassMap: Record<MetricIntent, string> = {
  primary: "metric-tile--primary",
  neutral: "metric-tile--neutral",
  positive: "metric-tile--positive",
  warning: "metric-tile--warning",
  danger: "metric-tile--danger"
};

export function MetricTile({
  label,
  value,
  delta,
  intent = "neutral",
  icon,
  className,
  children
}: MetricTileProps) {
  return (
    <div className={clsx("metric-tile", intentClassMap[intent], className)}>
      <div className="metric-tile__meta">
        <span className="metric-tile__label">{label}</span>
        {delta && <span className="metric-tile__delta">{delta}</span>}
      </div>
      <div className="metric-tile__value">
        {icon && <span className="metric-tile__icon" aria-hidden>{icon}</span>}
        <span>{value}</span>
      </div>
      {children && <div className="metric-tile__extra">{children}</div>}
    </div>
  );
}
