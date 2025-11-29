'use client';

import { clsx } from "clsx";
import { ReactNode } from "react";

export type NavigationItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
  notifications?: number;
  onSelect?: () => void;
};

type NavigationRailProps = {
  items: NavigationItem[];
  footer?: ReactNode;
  className?: string;
};

export function NavigationRail({ items, footer, className }: NavigationRailProps) {
  return (
    <nav className={clsx("navigation-rail", className)} aria-label="Primary">
      <div className="navigation-rail__items">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={clsx("navigation-rail__item", item.active && "is-active")}
            onClick={item.onSelect}
          >
            {item.icon && <span className="navigation-rail__icon" aria-hidden>{item.icon}</span>}
            <span className="navigation-rail__label">{item.label}</span>
            {item.notifications && item.notifications > 0 && (
              <span className="navigation-rail__badge" aria-label={`${item.notifications} pending`}>
                {item.notifications}
              </span>
            )}
          </button>
        ))}
      </div>
      {footer && <div className="navigation-rail__footer">{footer}</div>}
    </nav>
  );
}
