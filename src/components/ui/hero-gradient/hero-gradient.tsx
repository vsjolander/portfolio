"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import shaderSource from "./hero-gradient.wgsl"

import "./hero-gradient.css"

/** Uniform buffer: 20 * f32 = 80 bytes (multiple of 16). */
const UNIFORM_BYTES = 80
/** Entrance duration in ms — how long the glow takes to unfurl downward. */
const ENTRANCE_MS = 1200
/**
 * How long the band is held fully transparent after mount, so the page's own
 * entrance lands first. The nav's FadeIn ladder starts at 1000/1100/1200ms and
 * each item runs a 900ms transition, so the last settles around 2100ms.
 * Overridable per-instance via the `delay` prop.
 *
 * WebGPU still initialises immediately during the wait — only the reveal is
 * deferred — so the grow-in starts on an already-warm device.
 */
const ENTRANCE_DELAY_MS = 1400
/**
 * Exponent of the vertical brightness/alpha decay across the band. >1 pulls the
 * glow up toward the top edge; it reaches 0 at the bottom either way.
 */
const FALLOFF_POW = 3
/** How bright the left/right screen edges stay (0 = fully dark, 1 = no dimming). */
const SIDE_MIN = 0
/** Exponent of the horizontal decay. >1 tightens the glow toward the centre. */
const SIDE_POW = 2.2
/** Overall glow brightness, 0..1. Turn down if the bloom is too hot. */
const GLOW_INTENSITY = 0.8
/** Grain cell size in CSS px. 1 is per-pixel grain; higher is chunkier. */
const NOISE_SCALE = 0.2
/** Grain strength, 0 (off) .. 1 (heavy). */
const NOISE_AMOUNT = 0
/** Blue-green tint blended into the darker end of the gradient, 0..1. */
const TINT_AMOUNT = 2
/** How sharply the tint ramps in toward the dark end. Higher = more confined. */
const TINT_POW = 1
/** Diagonal sheen orientation, in radians. */
const SHEEN_ANGLE = 2.2
/** Diagonal sheen spatial frequency — how many soft ridges cross the band. */
const SHEEN_FREQ = 1.8
/** Diagonal sheen drift speed. Small = slow. */
const SHEEN_SPEED = 0.12
/** How dark the sheen's troughs get, 0 (deep) .. 1 (no sheen). */
const SHEEN_MIN = 0.45
/** Diagonal sheen contrast exponent. Higher = tighter bright ridge. */
const SHEEN_POW = 1.6
/** Sheen phase used when the visitor prefers reduced motion (frozen frame). */
const FROZEN_TIME = 6
/**
 * Device-pixel-ratio cap. A smooth gradient carries no high-frequency detail,
 * so 2x is plenty and keeps the fragment count down on this short band.
 */
const MAX_DPR = 2

/**
 * Whether the page is in dark mode — next-themes toggles `.dark` on <html>.
 * Drives the gradient direction: brightest stop at the top on dark, darkest at
 * the top on light.
 */
function isDark(): boolean {
  return document.documentElement.classList.contains("dark")
}

export function HeroGradient({
  className,
  delay = ENTRANCE_DELAY_MS,
}: {
  className?: string
  /** ms to wait after mount before the band starts unfurling. */
  delay?: number
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas || !navigator.gpu) return

    let disposed = false
    let device: GPUDevice | null = null
    let frame = 0

    // Mutable render state, written by the observers below and read each frame.
    const state = {
      visible: true,
      reduced: false,
      width: 1,
      height: 1,
      dpr: 0,
      dark: isDark(),
      start: 0,
      // False until the entrance delay elapses. While false the shader is still
      // running, but every frame comes out fully transparent.
      armed: false,
      // Set by init() once a frame can be drawn, so the arm timer can force a
      // redraw in the reduced-motion case where no rAF loop is running.
      redraw: null as (() => void) | null,
    }

    const uniforms = new ArrayBuffer(UNIFORM_BYTES)
    const f32 = new Float32Array(uniforms)

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    state.reduced = motionQuery.matches

    const cleanups: Array<() => void> = []

    // Everything below is registered after `await requestAdapter()`, by which
    // point React may already have run this effect's cleanup — StrictMode does
    // exactly that on every mount in dev. Registering into an array that has
    // already been drained would leak the observer, so run it immediately in
    // that case instead.
    const registerCleanup = (fn: () => void) => {
      if (disposed) fn()
      else cleanups.push(fn)
    }

    // Hold the reveal until the page's own entrance has landed. Resetting
    // `start` re-baselines the unfurl clock to this moment, so the band always
    // gets its full ENTRANCE_MS regardless of how long the wait was.
    const armTimer = window.setTimeout(
      () => {
        if (disposed) return
        state.armed = true
        state.start = 0
        root.dataset.armed = "true"
        state.redraw?.()
      },
      Math.max(0, delay)
    )

    const init = async () => {
      const adapter = await navigator.gpu.requestAdapter()
      if (!adapter || disposed) return
      const dev = await adapter.requestDevice()
      if (disposed) {
        dev.destroy()
        return
      }
      device = dev

      const context = canvas.getContext("webgpu")
      if (!context) return

      const format = navigator.gpu.getPreferredCanvasFormat()
      // Premultiplied so the alpha tail composites over whatever the page
      // background is, in either theme, rather than over opaque black.
      context.configure({ device: dev, format, alphaMode: "premultiplied" })

      const shaderModule = dev.createShaderModule({ code: shaderSource })
      const pipeline = dev.createRenderPipeline({
        layout: "auto",
        vertex: { module: shaderModule, entryPoint: "vs" },
        fragment: {
          module: shaderModule,
          entryPoint: "fs",
          targets: [
            {
              format,
              blend: {
                color: {
                  srcFactor: "one",
                  dstFactor: "one-minus-src-alpha",
                },
                alpha: {
                  srcFactor: "one",
                  dstFactor: "one-minus-src-alpha",
                },
              },
            },
          ],
        },
        primitive: { topology: "triangle-list" },
      })

      const uniformBuffer = dev.createBuffer({
        size: UNIFORM_BYTES,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })

      const bindGroup = dev.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
      })

      // --- sizing ----------------------------------------------------------
      // Called at the top of every frame rather than driven by a
      // ResizeObserver alone — an observer can end up owning a disposed
      // instance across a Fast Refresh, and a canvas whose drawing buffer
      // disagrees with its CSS box renders a stretched frame. One
      // getBoundingClientRect per frame on a single element is cheap, and it
      // makes sizing correct regardless of observer delivery.
      //
      // DPR is tracked here too, not read once at init: dragging the window to
      // a display with a different pixel ratio has to resize the drawing buffer,
      // or the gradient renders at the wrong resolution.
      const syncSize = (): boolean => {
        const rect = root.getBoundingClientRect()
        const w = Math.max(1, Math.round(rect.width))
        const h = Math.max(1, Math.round(rect.height))
        const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1)
        if (w === state.width && h === state.height && dpr === state.dpr) {
          return false
        }
        state.width = w
        state.height = h
        state.dpr = dpr
        canvas.width = Math.max(1, Math.round(w * dpr))
        canvas.height = Math.max(1, Math.round(h * dpr))
        return true
      }
      syncSize()

      // --- render ----------------------------------------------------------
      const render = (nowMs: number) => {
        syncSize()
        if (!state.start) state.start = nowMs
        const elapsed = (nowMs - state.start) / 1000

        // Before arming this is 0, which collapses the band's depth to nothing —
        // the pass still runs, but paints nothing.
        const entrance = !state.armed
          ? 0
          : state.reduced
            ? 1
            : 1 - Math.pow(1 - Math.min(1, (elapsed * 1000) / ENTRANCE_MS), 3)

        f32[0] = canvas.width
        f32[1] = canvas.height
        f32[2] = state.reduced ? FROZEN_TIME : elapsed
        f32[3] = entrance
        // Full band depth: the glow reaches 0 exactly at the bottom edge at any
        // viewport size, so it can never be clipped.
        f32[4] = canvas.height
        f32[5] = state.dark ? 0 : 1
        f32[6] = FALLOFF_POW
        f32[7] = SIDE_MIN
        f32[8] = SIDE_POW
        f32[9] = NOISE_SCALE * state.dpr
        f32[10] = NOISE_AMOUNT
        f32[11] = GLOW_INTENSITY
        f32[12] = TINT_AMOUNT
        f32[13] = TINT_POW
        f32[14] = SHEEN_ANGLE
        f32[15] = SHEEN_FREQ
        f32[16] = SHEEN_SPEED
        f32[17] = SHEEN_MIN
        f32[18] = SHEEN_POW
        dev.queue.writeBuffer(uniformBuffer, 0, uniforms)

        const encoder = dev.createCommandEncoder()
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: context.getCurrentTexture().createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        })
        pass.setPipeline(pipeline)
        pass.setBindGroup(0, bindGroup)
        pass.draw(3)
        pass.end()
        dev.queue.submit([encoder.finish()])

        root.dataset.live = "true"
      }

      // Reduced motion draws a single frozen frame and only redraws when the
      // theme or the viewport changes — no rAF loop at all.
      const drawOnce = () => {
        if (disposed) return
        render(performance.now())
      }
      state.redraw = drawOnce

      // The sheen drifts continuously, so the loop runs for as long as the band
      // is on screen (the IntersectionObserver below stops it once scrolled
      // past). Reduced motion draws a single frozen frame instead.
      const loop = (now: number) => {
        if (disposed) return
        render(now)
        frame = requestAnimationFrame(loop)
      }

      const startLoop = () => {
        if (disposed || frame) return
        if (state.reduced) {
          drawOnce()
          return
        }
        frame = requestAnimationFrame(loop)
      }

      const stopLoop = () => {
        if (frame) cancelAnimationFrame(frame)
        frame = 0
      }

      // Once the grow-in has settled (or under reduced motion) there is no frame
      // loop running, so a resize has to trigger its own redraw. While the loop
      // is live it picks the new size up on its own.
      const resizeObserver = new ResizeObserver(() => {
        if (disposed) return
        if (syncSize() && !frame) drawOnce()
      })
      resizeObserver.observe(root)
      registerCleanup(() => resizeObserver.disconnect())

      // The band is only ~300px tall and scrolls away immediately; without this
      // the shader would keep burning GPU behind the entire work history.
      const io = new IntersectionObserver(
        ([entry]) => {
          state.visible = entry.isIntersecting
          if (state.visible) startLoop()
          else stopLoop()
        },
        { threshold: 0 }
      )
      io.observe(root)
      registerCleanup(() => {
        io.disconnect()
        stopLoop()
      })

      const onVisibility = () => {
        if (document.hidden) stopLoop()
        else if (state.visible) startLoop()
      }
      document.addEventListener("visibilitychange", onVisibility)
      registerCleanup(() =>
        document.removeEventListener("visibilitychange", onVisibility)
      )

      // next-themes toggles `.dark` on <html>; flip the gradient direction when
      // it does.
      const themeObserver = new MutationObserver(() => {
        state.dark = isDark()
        if (!frame) drawOnce()
      })
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "style"],
      })
      registerCleanup(() => themeObserver.disconnect())

      const onMotionChange = (e: MediaQueryListEvent) => {
        state.reduced = e.matches
        stopLoop()
        startLoop()
      }
      motionQuery.addEventListener("change", onMotionChange)
      registerCleanup(() =>
        motionQuery.removeEventListener("change", onMotionChange)
      )

      // A lost device (tab backgrounded for a long time, driver reset) fades
      // the canvas back out rather than freezing on a stale final frame.
      dev.lost.then(() => {
        if (disposed) return
        stopLoop()
        delete root.dataset.live
      })

      startLoop()
    }

    init().catch(() => {
      // No adapter, no device, or shader compilation failed. There is no
      // fallback, so the band simply stays empty and the page reads as normal.
      delete root.dataset.live
    })

    return () => {
      disposed = true
      window.clearTimeout(armTimer)
      if (frame) cancelAnimationFrame(frame)
      cleanups.forEach((fn) => fn())
      device?.destroy()
    }
  }, [delay])

  return (
    <div ref={rootRef} className={cn("hero-gradient", className)} aria-hidden>
      <canvas ref={canvasRef} className="hero-gradient__canvas" />
    </div>
  )
}
