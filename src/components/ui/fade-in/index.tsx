"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface FadeInProps {
  children: React.ReactNode
  className?: string
  /**
   * Delay in ms before the animation starts.
   * Use this to stagger items within a section.
   */
  delay?: number
  /**
   * When true, animate on mount (above the fold).
   * When false (default), animate when scrolled into view.
   */
  immediate?: boolean
}

export function FadeIn({
  children,
  className,
  delay = 0,
  immediate = false,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (immediate) {
      const t = setTimeout(() => setVisible(true), delay)
      return () => clearTimeout(t)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -32px 0px" }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [immediate, delay])

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(20px)",
        transition:
          "opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {children}
    </div>
  )
}
