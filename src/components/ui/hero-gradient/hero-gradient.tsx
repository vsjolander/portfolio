"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import shaderSource from "./hero-gradient.wgsl"

import "./hero-gradient.css"

/** Uniform buffer: 32 * f32 = 128 bytes (multiple of 16). */
const UNIFORM_BYTES = 128
/**
 * Reveal duration in ms — how long the circle of light takes to expand from the
 * centre of the plane out past the far corners of the grid.
 */
const ENTRANCE_MS = 1600
/**
 * Width of the reveal front's soft edge, in world units. This is what an
 * individual dot fades over, so it sets both how gradual one dot's fade-up is
 * and how blurry the expanding ring of light looks. The lattice is ~2.3 units
 * deep, for scale. 0 would snap dots on instantly.
 */
const REVEAL_SOFT = 1.2
/**
 * How long the grid is held fully transparent after mount, so the page's own
 * entrance lands first. The nav's FadeIn ladder starts at 1000/1100/1200ms and
 * each item runs a 900ms transition, so the last settles around 2100ms.
 * Overridable per-instance via the `delay` prop.
 *
 * WebGPU still initialises immediately during the wait — only the entrance is
 * deferred — so the reveal starts on an already-warm device.
 */
const ENTRANCE_DELAY_MS = 1400

/**
 * Pitch of the plane, in radians. 0 would be a wall facing the camera; pi/2 a
 * floor seen edge-on. ~66deg gives a table receding to a horizon near the top
 * of the band, which is what makes the wave's lift read as parallax.
 */
const TILT = 1.36
/**
 * Distance from the camera to the centre of the plane. Smaller means a wider
 * field of view and a stronger near/far size difference. Must stay comfortably
 * above `sin(TILT) * GRID_OVERSCAN`, or the near rows pass behind the camera.
 */
const CAM_DIST = 2
/** Number of dot rows from the near edge to the far edge. Sets the density. */
const ROWS = 50
/**
 * How far the lattice extends past the edges of the band. The projection is
 * solved so the plane's +-1 depth edges land exactly on the top and bottom of
 * the canvas, so anything over 1 is margin that keeps those edges off-screen.
 */
const GRID_OVERSCAN = 1.15
/**
 * Dot radius as a fraction of the lattice spacing (0.5 would make dots touch).
 *
 * Tuned for small dots against the rest of the current setup. The rows that
 * actually survive FALLOFF_POW run from the near edge back to about gz -0.2;
 * across that band 0.035 puts every dot between ~1.8 and ~0.9 css px of radius,
 * so on a 2x display even the faintest visible dot still covers a device pixel
 * or more. Going smaller does not make the grid finer, it just pushes the back
 * of the visible band under a pixel, where dots stop being discs and turn into
 * alpha haze. Going bigger costs the airiness — the nearest rows are 17.7px
 * apart on screen and 0.035 makes a 3.6px dot, a comfortable 20% of that.
 */
const DOT_SIZE = 0.035
/**
 * Floor on a dot's drawn radius, in *device* pixels.
 *
 * A disc under about a pixel is a coin toss for the rasteriser, so a drifting
 * field of them scintillates. Dots smaller than this are drawn at this size and
 * dimmed by the area they lost, which trades the twinkle for a smooth fade.
 * With MAX_DPR 2 this mostly bites on non-retina displays and on the far haze.
 */
const MIN_DOT_PX = 0.75
/** Hard cap on instance count, so an ultrawide window cannot explode the draw. */
const MAX_DOTS = 25000

/**
 * How fast crests travel outward, in world units per second. Together with
 * WAVE_LENGTH this sets the cycle time a dot experiences: length / speed, so
 * 3.4 / 0.2 is a ~17s swell.
 */
const WAVE_SPEED = 0.2
/**
 * Distance between successive crests, in world units. Your grid reaches a
 * radius of ~2.9, so at 3.4 rather less than a full cycle is visible at once:
 * one long swell rolling through, which is what keeps it smooth. Shortening
 * this is what turns it back into a busy field of ripples.
 */
const WAVE_LENGTH = 3.4
/**
 * Peak displacement along the plane normal, in world units. The cosine is
 * signed, so a dot swings this far *either side* of the plane — half the old
 * one-sided torus value gives the same total travel. At the current tilt this
 * is roughly +-23px on screen.
 */
const WAVE_AMP = 0.05
/** Exponential decay with radius, so the swell flattens toward the edges. */
const WAVE_DECAY = 0.18

/**
 * Exponent of the fade toward the top of the band. >1 keeps the near rows solid
 * and dissolves the horizon, where the lattice would otherwise pile up into a
 * hard bar. Raised alongside INTENSITY: the boost lifts the whole curve, so the
 * exponent has to bite harder for the horizon to still disappear.
 */
const FALLOFF_POW = 2.2
/** Height of the fade at the very bottom edge, in 0..1 of the band. */
const BOTTOM_FADE = 0.1
/** How bright the left/right screen edges stay (0 = fully faded, 1 = no mask). */
const SIDE_MIN = 0
/** Exponent of the horizontal decay. >1 tightens the grid toward the centre. */
const SIDE_POW = 2.2
/**
 * Dot brightness. Values above 1 are the point of this knob, not a mistake:
 * alpha is clamped, so raising it widens the region that reaches *full* white
 * instead of making anything brighter than white.
 *
 * The depth falloffs multiply together, so without a boost a dot halfway up the
 * band sits near 10% alpha — and 10% white over a dark page is grey, whatever
 * colour the dot nominally is. At 3, the lower half of the band saturates to
 * solid white and the falloff only bites over the top half. The screen-edge,
 * bottom-edge and reveal masks are applied after the clamp, so they are
 * untouched by this.
 */
const INTENSITY = 3
/**
 * Alpha of the furthest row relative to the nearest, 0..1. Depth used to be a
 * colour ramp toward a mid grey, which is exactly what stopped the dots reading
 * as white; it is carried by alpha instead. 1 makes the grid perfectly flat in
 * tone, 0 fades the far rows out entirely.
 */
const FAR_DIM = 0.7
/** Extra brightness on dots riding a crest. 0 makes the wave pure geometry. */
const CREST_BOOST = 0.9
/**
 * Wave phase used when the visitor prefers reduced motion (frozen frame). The
 * wave is fully formed at every moment, so this only picks which instant of the
 * swell the still is frozen on.
 */
const FROZEN_TIME = 6
/**
 * Device-pixel-ratio cap. The dots are antialiased analytically in the fragment
 * shader, so 2x is plenty and keeps the fragment count down on this short band.
 */
const MAX_DPR = 2

/**
 * Camera and lattice values derived from the constants above plus the current
 * aspect ratio.
 *
 * `focal` and `camY` are not tuned by hand — they are solved so the plane's
 * near edge (depth -1) lands on the bottom of the band and its far edge
 * (depth +1) on the top, whatever TILT and CAM_DIST are. Writing
 * `ndcY = focal * (camY + d * cos t) / (camDist + d * sin t)` for d = -1 and
 * d = +1 and asking for -1 and +1 gives focal = camDist / cos t and
 * camY = sin t * cos t / camDist. That means TILT can be changed freely without
 * the grid sliding out of the band.
 */
function geometry(aspect: number) {
  const ct = Math.cos(TILT)
  const st = Math.sin(TILT)
  const focal = CAM_DIST / ct
  const camY = (st * ct) / CAM_DIST
  const halfD = GRID_OVERSCAN
  const spacing = (2 * halfD) / (ROWS - 1)
  // The far row is the widest thing on screen, so size the lattice to cover it.
  const halfW =
    ((aspect * ct * (CAM_DIST + st * halfD)) / CAM_DIST) * GRID_OVERSCAN
  const cols = Math.max(
    2,
    Math.min(Math.floor(MAX_DOTS / ROWS), Math.floor((2 * halfW) / spacing) + 1)
  )
  return {
    focal,
    camY,
    halfD,
    spacing,
    cols,
    instances: cols * ROWS,
    // Radius that covers the whole lattice — the light-up front sweeps to it.
    maxR: Math.hypot(((cols - 1) * spacing) / 2, halfD),
  }
}

/**
 * Whether the page is in dark mode — next-themes toggles `.dark` on <html>.
 * Picks the dot ink: white on dark backgrounds, near-black on light ones.
 */
function isDark(): boolean {
  return document.documentElement.classList.contains("dark")
}

export function HeroGradient({
  className,
  delay = ENTRANCE_DELAY_MS,
}: {
  className?: string
  /** ms to wait after mount before the grid starts sweeping in. */
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

    // Hold the entrance until the page's own has landed. Resetting `start`
    // re-baselines the clock to this moment, so the grid always gets its full
    // ENTRANCE_MS regardless of how long the wait was.
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
      // Premultiplied so the dots composite over whatever the page background
      // is, in either theme, rather than over opaque black.
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
        // One quad per dot, expanded from four corners in the vertex shader.
        // No cull mode is set, so the strip's winding does not matter.
        primitive: { topology: "triangle-strip" },
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
      // or the grid renders at the wrong resolution.
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

        // Before arming both phases sit at 0, which collapses the light-up
        // front to nothing — the pass still runs, but paints nothing.
        //
        // Eased out, so the circle of light leaves the centre quickly and
        // decelerates as it reaches the corners.
        const elapsedMs = state.armed ? elapsed * 1000 : 0
        const reveal = state.reduced
          ? 1
          : 1 - Math.pow(1 - Math.min(1, elapsedMs / ENTRANCE_MS), 3)


        // The lattice is re-derived per frame because it depends on the aspect
        // ratio: a wider window needs more columns to reach the screen edges.
        const aspect = canvas.width / Math.max(canvas.height, 1)
        const g = geometry(aspect)

        f32[0] = canvas.width
        f32[1] = canvas.height
        // The wave shares the entrance clock and runs from the first frame, so
        // every dot is already at its wave height before the reveal lights it.
        f32[2] = state.reduced ? FROZEN_TIME : elapsedMs / 1000
        f32[3] = reveal
        f32[4] = aspect
        f32[5] = TILT
        f32[6] = CAM_DIST
        f32[7] = g.camY
        f32[8] = g.focal
        f32[9] = g.cols
        f32[10] = g.spacing
        f32[11] = g.halfD
        f32[12] = g.spacing * DOT_SIZE
        f32[13] = MIN_DOT_PX
        f32[14] = WAVE_SPEED
        f32[15] = WAVE_LENGTH
        f32[16] = WAVE_AMP
        f32[17] = WAVE_DECAY
        f32[18] = g.maxR
        f32[19] = REVEAL_SOFT
        f32[20] = FALLOFF_POW
        f32[21] = BOTTOM_FADE
        f32[22] = SIDE_MIN
        f32[23] = SIDE_POW
        f32[24] = state.dark ? 0 : 1
        f32[25] = INTENSITY
        f32[26] = CREST_BOOST
        f32[27] = FAR_DIM
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
        pass.draw(4, g.instances)
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

      // The rings travel continuously, so the loop runs for as long as the band
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

      // Under reduced motion there is no frame loop running, so a resize has to
      // trigger its own redraw. While the loop is live it picks the new size up
      // on its own.
      const resizeObserver = new ResizeObserver(() => {
        if (disposed) return
        if (syncSize() && !frame) drawOnce()
      })
      resizeObserver.observe(root)
      registerCleanup(() => resizeObserver.disconnect())

      // The band is only ~200px tall and scrolls away immediately; without this
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

      // next-themes toggles `.dark` on <html>; flip the palette direction when
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
