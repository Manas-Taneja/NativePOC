'use client';

import { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  icon,
  trailingIcon,
  loading = false,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx("button", `button--${variant}`, className)}
      disabled={disabled || loading}
      data-loading={loading ? "true" : undefined}
      {...rest}
    >
      {icon && <span className="button__icon" aria-hidden>{icon}</span>}
      <span className="button__label">{children}</span>
      {(trailingIcon || loading) && (
        <span className="button__icon" aria-hidden>
          {loading ? <span className="button__spinner" /> : trailingIcon}
        </span>
      )}
    </button>
  );
}
