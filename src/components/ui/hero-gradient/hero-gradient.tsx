"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import shaderSource from "./hero-gradient.wgsl"

import "./hero-gradient.css"

/** Number of stops in the cyclic colour ramp. Must match the shader. */
const STOP_COUNT = 5
/** Uniform buffer size: vec2f + 6 * f32 padded to 32, then 5 * vec4f. */
const UNIFORM_BYTES = 32 + STOP_COUNT * 16
/** Target ribbon width in CSS px, before the 3..7 count clamp is applied. */
const RIBBON_TARGET_PX = 340
const RIBBON_MIN_COUNT = 1
const RIBBON_MAX_COUNT = 3
/** Entrance duration in ms — how long the band takes to unfurl downward. */
const ENTRANCE_MS = 1200
/**
 * How long the band is held fully transparent after mount, so the page's own
 * entrance lands first. The nav's FadeIn ladder starts at 1000/1100/1200ms and
 * each item runs a 900ms transition, so the last settles around 2100ms.
 * Overridable per-instance via the `delay` prop.
 *
 * WebGPU still initialises immediately during the wait — only the reveal is
 * deferred — so the unfurl starts on an already-warm device.
 */
const ENTRANCE_DELAY_MS = 1400
/**
 * Exponent of the vertical alpha decay across the band. 1 is linear; higher
 * values weight opacity harder toward the top edge and pull the visible depth
 * up, reaching 0 at the bottom edge either way.
 */
const FALLOFF_POW = 4
/** Field state used when the visitor prefers reduced motion. */
const FROZEN_TIME = 12

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/** `#rrggbb` (or `#rgb`) from a CSS custom property -> linear RGB. */
function parseStop(value: string): [number, number, number] {
  let hex = value.trim().replace(/^#/, "")
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  const n = parseInt(hex, 16)
  if (hex.length !== 6 || Number.isNaN(n)) return [0, 0, 0]
  return [
    srgbToLinear(((n >> 16) & 255) / 255),
    srgbToLinear(((n >> 8) & 255) / 255),
    srgbToLinear((n & 255) / 255),
  ]
}

/**
 * Reads the ramp from the `--vos-gradient-*` tokens on :root, so the palettes
 * live in layout.css next to the other theme tokens and swap with next-themes'
 * `.dark` class without touching the shader.
 */
function readRamp(): Float32Array {
  const styles = getComputedStyle(document.documentElement)
  const out = new Float32Array(STOP_COUNT * 4)
  for (let i = 0; i < STOP_COUNT; i++) {
    const [r, g, b] = parseStop(styles.getPropertyValue(`--vos-gradient-${i}`))
    out.set([r, g, b, 1], i * 4)
  }
  return out
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
      ramp: readRamp(),
      rampDirty: true,
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
      // DPR is capped at 1: the effect has no detail above a few cycles per
      // screen, so rendering 4x the fragments on a Retina display buys nothing.
      //
      // Called at the top of every frame rather than driven by a
      // ResizeObserver alone — an observer can end up owning a disposed
      // instance across a Fast Refresh, and a canvas whose drawing buffer
      // disagrees with its CSS box renders a stretched frame. One
      // getBoundingClientRect per frame on a single element is cheap, and it
      // makes sizing correct regardless of observer delivery.
      const syncSize = (): boolean => {
        const rect = root.getBoundingClientRect()
        const w = Math.max(1, Math.round(rect.width))
        const h = Math.max(1, Math.round(rect.height))
        if (w === state.width && h === state.height) return false
        state.width = w
        state.height = h
        canvas.width = w
        canvas.height = h
        return true
      }
      syncSize()

      // --- render ----------------------------------------------------------
      const render = (nowMs: number) => {
        syncSize()
        if (!state.start) state.start = nowMs
        const elapsed = (nowMs - state.start) / 1000

        // Before arming this is 0, which collapses the band's depth and its
        // alpha to nothing — the pass still runs, but paints nothing.
        const entrance = !state.armed
          ? 0
          : state.reduced
            ? 1
            : 1 - Math.pow(1 - Math.min(1, (elapsed * 1000) / ENTRANCE_MS), 3)

        const count = Math.min(
          RIBBON_MAX_COUNT,
          Math.max(RIBBON_MIN_COUNT, Math.round(state.width / RIBBON_TARGET_PX))
        )

        f32[0] = state.width
        f32[1] = state.height
        f32[2] = state.reduced ? FROZEN_TIME : elapsed
        f32[3] = entrance
        f32[4] = state.width / count
        // Depth is the full band height, so alpha reaches exactly 0 at the
        // bottom edge at every viewport size and can never be clipped.
        f32[5] = state.height
        f32[6] = FALLOFF_POW
        if (state.rampDirty) {
          f32.set(state.ramp, 8)
          state.rampDirty = false
        }
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

      // With reduced motion there is no frame loop to pick the new size up, so
      // a resize has to trigger its own redraw.
      const resizeObserver = new ResizeObserver(() => {
        if (disposed) return
        if (syncSize() && state.reduced) drawOnce()
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

      // next-themes toggles `.dark` on <html>; re-read the ramp when it does.
      const themeObserver = new MutationObserver(() => {
        state.ramp = readRamp()
        state.rampDirty = true
        if (state.reduced) drawOnce()
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
