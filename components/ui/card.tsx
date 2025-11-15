"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { cardHoverAnimation } from "@/lib/animations"

export interface CardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  variant?: "default" | "interactive" | "flat" | "grouped" | "accent"
  children?: React.ReactNode
  className?: string
}

/**
 * Card - Foundational iOS-style card component
 * 
 * Variants:
 * - default: Standard card with shadow
 * - interactive: Adds hover/tap animations
 * - flat: No shadow, just background
 * - grouped: iOS Settings-style grouped appearance
 * - accent: Subtle accent border on left edge
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", className, children, ...props }, ref) => {
    const baseStyles = "rounded-2xl transition-colors duration-200"
    
    const variantStyles = {
      default: "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-md)]",
      interactive: "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-md)] cursor-pointer",
      flat: "bg-[var(--color-bg-elevated)] border-0",
      grouped: "bg-[var(--color-bg-elevated)] border-0 overflow-hidden",
      accent: "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-md)] border-l-4 border-l-[var(--color-accent)]",
    }

    const MotionComponent = variant === "interactive" ? motion.div : "div"
    const motionProps = variant === "interactive" ? cardHoverAnimation : {}

    if (variant === "interactive") {
      return (
        <motion.div
          ref={ref}
          className={cn(baseStyles, variantStyles[variant], className)}
          {...motionProps}
          {...props}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...(props as any)}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = "Card"

/**
 * CardHeader - Header section of a card
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-5", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * CardTitle - Title element for card header
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-[var(--color-fg-primary)]",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * CardDescription - Description text for card header
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[var(--color-fg-secondary)]", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * CardContent - Main content area of a card
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * CardFooter - Footer section of a card
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-5 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

