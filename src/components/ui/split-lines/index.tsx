"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { SplitText } from "gsap/SplitText"
import { CustomEase } from "gsap/CustomEase"

gsap.registerPlugin(SplitText, CustomEase)

CustomEase.create("cine", "0.34, 1.23, 0.64, 1")

interface SplitLinesProps {
  children: string
  className?: string
  /** Delay in ms before the animation starts. */
  delay?: number
}

export function SplitLines({
  children,
  className,
  delay = 0,
}: SplitLinesProps) {
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const split = SplitText.create(el, {
      type: "lines",
      autoSplit: true,
      linesClass: "split-line",
      onSplit: (self) => {
        const tl = gsap.timeline({ delay: delay / 1000 })
        tl.from(
          self.lines,
          {
            opacity: 0,
            filter: "blur(8px)",
            duration: 0.4,
            ease: "cine",
            stagger: { each: 0.03 },
          },
          0
        )
        tl.from(
          self.lines,
          {
            y: 20,
            duration: 0.6,
            ease: "cine",
            stagger: { each: 0.03 },
          },
          0
        )
        return tl
      },
    })

    return () => split.revert()
  }, [delay])

  return (
    <p ref={ref} className={className}>
      {children}
    </p>
  )
}
