import { Transition, Variants } from "framer-motion"

/**
 * iOS-style spring animation configuration
 * Use this for most animations to get that natural, bouncy iOS feel
 */
export const springConfig: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
}

/**
 * Tighter spring for quick interactions
 */
export const tightSpring: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 35,
}

/**
 * Gentle spring for large elements
 */
export const gentleSpring: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
}

/**
 * Simple fade in animation
 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Fade in with upward slide (iOS sheet style)
 */
export const slideUpFadeIn: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

/**
 * Subtle fade in for chat messages (opacity only to prevent overflow issues)
 */
export const chatMessageFadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Fade out only (no movement) for in-place transitions
 */
export const fadeOutOnly: Variants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

/**
 * iOS-style tactile interaction for buttons
 */
export const iosTactile: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
}

/**
 * Card interaction with iOS-style lift effect
 */
export const iosCard: Variants = {
  rest: {
    scale: 1,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.4)",
  },
  hover: {
    scale: 1.01,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
  },
  tap: {
    scale: 0.99,
  },
}

/**
 * Modal/Sheet entry from bottom (like iOS)
 */
export const iosSheet: Variants = {
  initial: { y: "100%", opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: "100%", opacity: 0 },
}

/**
 * Scale in animation (for context menus, dropdowns)
 */
export const scaleIn: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
}

/**
 * Slide down from top (for notifications)
 */
export const slideDown: Variants = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -100, opacity: 0 },
}

/**
 * Stagger children animation
 * Use with staggerChildren in parent transition
 */
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.04, // 40ms between each child (iOS timing)
    },
  },
}

/**
 * Item for staggered lists
 */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

/**
 * Smooth height animation (for expanding sections)
 */
export const expandHeight: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: "auto", opacity: 1 },
}

/**
 * Press feedback for interactive elements (iOS-style)
 */
export const pressAnimation = {
  whileHover: { scale: 1.02, transition: springConfig },
  whileTap: { scale: 0.98, transition: { duration: 0.1 } },
}

/**
 * Subtle hover animation for cards
 */
export const cardHoverAnimation = {
  whileHover: {
    scale: 1.01,
    transition: springConfig,
  },
  whileTap: {
    scale: 0.99,
    transition: { duration: 0.1 },
  },
}

/**
 * Navigation transition (page changes)
 */
export const pageTransition: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

/**
 * Pulse animation (for loading indicators)
 */
export const pulse: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

/**
 * Shake animation (for errors)
 */
export const shake: Variants = {
  animate: {
    x: [0, -4, 4, -4, 4, 0],
    transition: {
      duration: 0.4,
    },
  },
}

