"use client"

import * as React from "react"

/**
 * Hook to trap focus within a container element (e.g., modals)
 * Also restores focus to the previously focused element when unmounted
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = React.useRef<HTMLElement | null>(null)
  const previousFocusRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    if (!isActive) return

    // Store the currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement

    const container = containerRef.current
    if (!container) return

    // Get all focusable elements within the container
    const getFocusableElements = (): HTMLElement[] => {
      const selector = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ')

      return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
      )
    }

    const focusableElements = getFocusableElements()

    if (focusableElements.length === 0) return

    // Focus the first element
    focusableElements[0]?.focus()

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)

      if (e.shiftKey) {
        // Shift + Tab: move backwards
        if (currentIndex === 0 || currentIndex === -1) {
          e.preventDefault()
          focusableElements[focusableElements.length - 1]?.focus()
        }
      } else {
        // Tab: move forwards
        if (currentIndex === focusableElements.length - 1 || currentIndex === -1) {
          e.preventDefault()
          focusableElements[0]?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTab)

    return () => {
      document.removeEventListener('keydown', handleTab)
      // Restore focus to the previously focused element
      previousFocusRef.current?.focus()
    }
  }, [isActive])

  return containerRef
}

