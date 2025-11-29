'use client';

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

type GlassCardProps = {
  title?: ReactNode;
  caption?: ReactNode;
  actionSlot?: ReactNode;
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
};

const cardVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 }
};

export function GlassCard({
  title,
  caption,
  actionSlot,
  className,
  children,
  footer
}: GlassCardProps) {
  return (
    <motion.section
      className={clsx("glass-card", className)}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {(title || actionSlot) && (
        <header className="glass-card__header">
          <div className="glass-card__title">
            {typeof title === "string" ? <h2>{title}</h2> : title}
            {caption && <p className="glass-card__caption">{caption}</p>}
          </div>
          {actionSlot && <div className="glass-card__actions">{actionSlot}</div>}
        </header>
      )}
      <div className="glass-card__body">{children}</div>
      {footer && <footer className="glass-card__footer">{footer}</footer>}
    </motion.section>
  );
}
