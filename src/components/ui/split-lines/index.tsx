"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { SplitText } from "gsap/SplitText"
import { CustomEase } from "gsap/CustomEase"

gsap.registerPlugin(SplitText, CustomEase)
CustomEase.create("custom-cine", "0.34, 1.30, 0.64, 1")

interface SplitLinesProps {
  children: string
  className?: string
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

    el.style.opacity = "0"

    const split = SplitText.create(el, {
      type: "lines",
      autoSplit: true,
      linesClass: "split-line",
      onSplit: (self) => {
        self.lines.forEach((node) => {
          // gsap types `SplitText.lines` as `Element[]`, which has no `style`.
          const line = node as HTMLElement
          line.style.setProperty("--reveal", "0%")
          line.style.backgroundImage =
            "radial-gradient(circle at center, hsl(var(--muted-foreground)) var(--reveal), hsl(var(--text-gradient-1)) calc(var(--reveal) + 10%), hsl(var(--text-gradient-2)) calc(var(--reveal) + 20%), hsl(var(--text-gradient-3)) calc(var(--reveal) + 30%), hsl(var(--text-gradient-3)) calc(var(--reveal) + 40%), transparent calc(var(--reveal) + 50%))"
          line.style.setProperty("background-clip", "text")
          line.style.setProperty("-webkit-background-clip", "text")
          line.style.setProperty("-webkit-text-fill-color", "transparent")
          line.style.color = "transparent"
        })

        // Reveal the paragraph only once the (delayed) timeline actually
        // starts, so it stays fully hidden while waiting out the delay.
        const tl = gsap.timeline({
          delay: delay / 1000,
          onStart: () => {
            el.style.opacity = "1"
          },
        })
        tl.from(
          self.lines,
          {
            opacity: 0,
            filter: "blur(10px)",
            duration: 0.4,
            ease: "custom-cine",
            stagger: { each: 0.03 },
          },
          0
        )
        tl.from(
          self.lines,
          {
            y: 20,
            duration: 0.6,
            ease: "custom-cine",
            stagger: { each: 0.03 },
          },
          0
        )
        tl.to(
          self.lines,
          {
            "--reveal": "140%",
            duration: 0.6,
            stagger: { each: 0.02, ease: "ease-out" },
          },
          0
        )

        return tl
      },
    })

    return () => split.revert()
  }, [delay])

  return (
    <p ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </p>
  )
}
