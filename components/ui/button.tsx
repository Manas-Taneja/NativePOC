"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { pressAnimation } from "@/lib/animations"

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "small" | "medium" | "large"
}

/**
 * Button - iOS-style pill-shaped button with tactile feedback
 * 
 * Variants:
 * - primary: Accent background, white text
 * - secondary: Subtle background, accent text
 * - outline: Transparent bg, accent border
 * - ghost: Transparent bg, subtle hover
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "medium", className, children, ...props }, ref) => {
    const baseStyles = "rounded-full font-medium transition-colors duration-200 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
    
    const variantStyles = {
      primary: "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]",
      secondary: "bg-[var(--color-accent-muted)] text-[var(--color-accent)] hover:bg-[var(--color-accent-border)]",
      outline: "bg-transparent border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]",
      ghost: "bg-transparent text-[var(--color-fg-primary)] hover:bg-[var(--color-bg-subtle)]",
    }

    const sizeStyles = {
      small: "px-4 py-2 text-sm h-9",
      medium: "px-6 py-3 text-base h-11",
      large: "px-7 py-4 text-lg h-14",
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...pressAnimation}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

export { Button }

