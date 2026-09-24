"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import shaderSource from "./hero-gradient.wgsl"

import "./hero-gradient.css"

/**
 * Uniform buffer: 37 contiguous f32 of payload, so the byte offset of field `i`
 * is exactly `i * 4` and the whole struct writes as one flat Float32Array with
 * no interior padding.
 *
 * Allocated at 40 floats (160 bytes) rather than the 38 the struct strictly
 * needs. The leading vec2f gives the struct an 8-byte alignment, so WGSL rounds
 * its size to 152 — Dawn reports exactly that as the minimum binding size — but
 * an implementation that rounds a uniform struct up to 16 instead would want
 * 160. Binding more than the minimum is always valid, so 160 satisfies both and
 * the trailing floats are simply never written.
 */
const UNIFORM_BYTES = 40 * 4
/**
 * Reveal duration in ms — how long the front takes to sweep from the row
 * closest to the camera back past the furthest one.
 */
const ENTRANCE_MS = 750
/**
 * Width of the reveal front's soft edge, as a fraction of the band's height.
 *
 * NOTE the units changed with the sweep: this used to be world units against a
 * ~2.3-deep lattice, and is now a fraction of the band, so the old 2 would be
 * an edge twice the height of the whole band. 0.5 carries over the same intent
 * — a generously soft front, half the band deep. At 0 whole rows snap on at
 * once; 0.2 gives a crisp travelling line.
 */
const REVEAL_SOFT = 0.5
/**
 * How long the grid is held fully transparent after mount, so the page's own
 * entrance lands first. The nav's FadeIn ladder starts at 1000/1100/1200ms and
 * each item runs a 900ms transition, so the last settles around 2100ms.
 * Overridable per-instance via the `delay` prop.
 *
 * WebGPU still initialises immediately during the wait — only the entrance is
 * deferred — so the reveal starts on an already-warm device.
 */
const ENTRANCE_DELAY_MS = 800

/**
 * Pitch of the plane, in radians. 0 would be a wall facing the camera; pi/2 a
 * plane seen edge-on. The plane falls away *downward* as it recedes, so the
 * near rows sit at the top of the window and the horizon is below the band.
 */
const TILT = 1.36
/**
 * Distance from the camera to the centre of the plane. Smaller means a wider
 * field of view and a stronger near/far size difference. Must stay comfortably
 * above `sin(TILT) * GRID_OVERSCAN`, or the near rows pass behind the camera.
 */
const CAM_DIST = 2
/** Number of dot rows from the near edge to the far edge. Sets the density. */
const ROWS = 90
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
const WAVE_SPEED = 0.05
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
 * Exponent of the fade toward the bottom of the band, where the plane falls
 * away to its horizon. >1 keeps the near rows solid and dissolves the far ones,
 * which would otherwise pile up into a hard bar. Raised alongside INTENSITY:
 * the boost lifts the whole curve, so the exponent has to bite harder for the
 * horizon to still disappear.
 */
const FALLOFF_POW = 2.2
/**
 * Height of the fade at the very top edge, in 0..1 of the band. The near rows
 * overshoot the band and are clipped there, so this stops them ending on a hard
 * cut directly under the nav.
 */
const EDGE_FADE = 0.1
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
 * Radius of the pointer ball, as a multiple of the lattice spacing.
 *
 * World units, and that is the entire point of it. A radius in device pixels
 * made the ball the same size everywhere on screen, which meant it dragged
 * around two cells' worth of near rows and six cells' worth of far ones — the
 * opposite of what a real object under the sheet would do.
 *
 * The spacing is ~0.047 world units, so 1.7 is a disc a little under three and
 * a half cells across. Projection scale runs from 9.35 at the top of the band
 * (plane depth -1) to 3.21 at the bottom (depth +1), so on the current 200px
 * band its on-screen radius runs from ~75 css px near to ~26 far — the far end
 * is a third of the near one, which is the visible depth cue being bought. Much
 * under 1.2 and there are too few dots inside to read as a disc at the far end;
 * much over 2.5 and the near-edge disc swallows the band.
 */
const BALL_RADIUS = 1.7
/**
 * Peak lift at the disc's centre, as a fraction of BALL_RADIUS. 1 would be a
 * true hemisphere; this is what squashes it into a saucer without touching its
 * footprint.
 *
 * At 0.45 the hull stands ~17 css px off the plane at the middle of the band,
 * against a ~75 css px radius — a little under a 1:4 height-to-width ratio,
 * which is about where a shape stops reading as a dome and starts reading as a
 * disc. For scale, the radial wave itself swings dots ~24 css px, so the disc
 * sits just below the swell it is riding on.
 */
const BALL_HEIGHT = 0.45
/**
 * Profile exponent of the disc's cross-section, (1 - dn^e)^(1/e).
 *
 * 2 is exactly a circle, so the shape collapses back to the sphere this started
 * as. Raising it flattens the middle and holds the height out toward the rim
 * before dropping it — 4 gives a saucer with a definite hull; past ~8 the sides
 * go vertical and it reads as a cylinder punched through the lattice.
 */
const BALL_EDGE = 4
/**
 * Outward in-plane splay, as a fraction of the lattice spacing. A scale on the
 * dn * dome curve rather than an exact maximum, since that curve's peak moves
 * with BALL_EDGE — at the default profile the real peak is ~0.7 of this. Above
 * ~0.7 dots are pushed past their neighbours' cells and the lattice stops
 * reading as a grid. Negative splays inward, which is what an inextensible
 * sheet would actually do.
 */
const BALL_SPLAY = 0.3
/**
 * Fraction of the radius at which the rim feather begins, 0..1. Inside it the
 * lattice sits on the exact superellipse; outside it the skirt is eased away,
 * because the profile has a vertical tangent at the rim — more so the flatter
 * the disc — and dots crossing it would pop. Below ~0.5 the hull softens into a
 * blob; above ~0.9 the pop comes back.
 */
const BALL_FEATHER = 0.7
/**
 * Time constant of the ball's chase, in ms — the centre closes 63% of the gap to
 * the cursor's hit point in this long. Frame-rate independent (see `ease`), so
 * it is the same weight at 60 and at 144Hz. 0 would nail the ball to the cursor;
 * this is what makes it visibly *travel*.
 */
const BALL_EASE_MS = 90
/** Fade-in of the ball's strength once the pointer arrives, in ms. */
const BALL_FADE_IN_MS = 120
/** Fade-out when the pointer leaves, goes stale, or the ray misses, in ms. */
const BALL_FADE_OUT_MS = 300
/**
 * How long a motionless pointer keeps its ball before it melts away, in ms. The
 * pointer only reports while it moves, so a cursor parked over the band is
 * indistinguishable from one that left the window past whatever leave events
 * happen to fire; without this backstop the bulge would be a permanent dent.
 */
const BALL_HOLD_MS = 1800
/**
 * How far past the edge of the lattice the ball fades out over, as a multiple of
 * the lattice spacing. The pointer is tracked on the window, not on the 200px
 * band, so it spends most of its life well outside the grid; this is what stops
 * a ball parked off the near edge from shearing the outermost row forever.
 */
const BALL_REACH = 4

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
 * near edge (depth -1) lands on the *top* of the band and its far edge
 * (depth +1) on the bottom, whatever TILT and CAM_DIST are. Writing
 * `ndcY = focal * (camY - d * cos t) / (camDist + d * sin t)` for d = -1 and
 * d = +1 and asking for +1 and -1 gives focal = camDist / cos t and
 * camY = -sin t * cos t / camDist. That means TILT can be changed freely
 * without the grid sliding out of the band.
 *
 * The minus signs are what put the near rows at the top: they pair with the
 * negated bitangent in the shader, which tips the plane downward as it recedes
 * instead of upward. Flip both together to turn it back into a floor.
 */
function geometry(aspect: number) {
  const ct = Math.cos(TILT)
  const st = Math.sin(TILT)
  const focal = CAM_DIST / ct
  const camY = -(st * ct) / CAM_DIST
  const halfD = GRID_OVERSCAN
  const spacing = (2 * halfD) / (ROWS - 1)
  // The far row is the widest thing on screen, so size the lattice to cover it.
  const halfW =
    ((aspect * ct * (CAM_DIST + st * halfD)) / CAM_DIST) * GRID_OVERSCAN
  const cols = Math.max(
    2,
    Math.min(Math.floor(MAX_DOTS / ROWS), Math.floor((2 * halfW) / spacing) + 1)
  )
  // Where a row at plane-depth `gz` lands down the band: 0 at the top, 1 at the
  // bottom. The reveal sweep is expressed in these units, so it needs the two
  // ends of the overscanned lattice — which sit outside 0..1 by however much
  // GRID_OVERSCAN adds.
  const depthScreen = (gz: number) =>
    0.5 - ((focal * (camY - gz * ct)) / (CAM_DIST + gz * st)) * 0.5

  return {
    focal,
    camY,
    halfD,
    halfW,
    spacing,
    cols,
    instances: cols * ROWS,
    revealFrom: depthScreen(-halfD),
    revealTo: depthScreen(halfD),
  }
}

/**
 * Where the ray through a screen point meets the dot plane, in the plane's own
 * (gx, gz) coordinates — the exact space the vertex shader lays the lattice out
 * in. Null when the ray misses.
 *
 * This depends only on the pointer and the camera, never on which dot is being
 * shaded, so it is solved once here rather than thousands of times in the vertex
 * shader. It is the algebraic inverse of the shader's `project()`: the camera is
 * at the origin looking down +Z, so the ray through `ndc` is
 *   P(t) = t * (ndc.x * aspect / focal, ndc.y / focal, 1),  t = view-space z
 * and intersecting it with dot(P - centre, normal) = 0 for the plane's centre
 * (0, camY, camDist) and normal (0, -sin t, -cos t) gives
 *   t = (camY * st + camDist * ct) / (d.y * st + ct).
 * The numerator is the perpendicular distance from the camera to the plane,
 * 0.3184 at the current tilt — a handy invariant if TILT is ever retuned.
 *
 * The denominator vanishes at the horizon, which sits at
 * ndc.y = -focal * ct / st = -2.045: a full band-height below the bottom of the
 * band, so anywhere over the band itself it stays between 0.107 and 0.312 and is
 * never close to zero. It matters anyway, because the pointer is tracked on the
 * window and can be a long way below the band: past the horizon the denominator
 * goes negative and the ray never meets the plane in front of the camera at all,
 * and just short of it `t` explodes (69 at ndc.y -2, 590 at -2.04). Both are
 * rejected here rather than clamped — clamping would pin the ball to the
 * horizon, where it would sit in the far rows shearing them forever.
 */
function planeHit(
  ndcX: number,
  ndcY: number,
  aspect: number,
  g: ReturnType<typeof geometry>
): { gx: number; gz: number } | null {
  const ct = Math.cos(TILT)
  const st = Math.sin(TILT)
  const dy = ndcY / g.focal
  const denom = dy * st + ct
  if (denom <= 1e-3) return null
  const t = (g.camY * st + CAM_DIST * ct) / denom
  // A hit this far down the plane is past the horizon in all but name.
  if (!(t > 0) || t > CAM_DIST * 4) return null
  const px = ((ndcX * aspect) / g.focal) * t
  const py = dy * t
  return { gx: px, gz: (py - g.camY) * -ct + (t - CAM_DIST) * st }
}

/**
 * Exponential smoothing that does not change weight with frame rate: the gap
 * closes by the same *fraction per millisecond* whether the display runs at 60
 * or 144Hz. A plain `cur += (target - cur) * k` would make the ball twice as
 * eager on a 120Hz display.
 */
function ease(
  cur: number,
  target: number,
  tauMs: number,
  dtMs: number
): number {
  return cur + (target - cur) * (1 - Math.exp(-dtMs / Math.max(tauMs, 1e-3)))
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
      // The band's box in client coordinates, refreshed by syncSize each frame.
      // Pointer samples are stored in client space and converted here at upload
      // time, so the move handler never has to touch layout.
      rectX: 0,
      rectY: 0,
      // Latest pointer position in client coordinates, plus when it was seen.
      // Converted to plane coordinates once per frame in render(), against the
      // rect syncSize just read — the move handler never touches layout.
      pointerX: 0,
      pointerY: 0,
      pointerAt: 0,
      // False before the first move, and again once the pointer leaves the
      // document or the window loses focus.
      pointerLive: false,
      // The ball's eased centre, in the plane's own coordinates. Plane space,
      // not screen space, so a resize does not teleport it.
      ballX: 0,
      ballZ: 0,
      // False until the ball has ever been placed, so the first hit snaps rather
      // than flying in from (0, 0).
      ballPlaced: false,
      ballStrength: 0,
      // Timestamp of the previous rendered frame, for frame-rate independent
      // easing. Zeroed when the loop stops, so resuming from a backgrounded tab
      // does not integrate a multi-second step.
      lastFrame: 0,
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
        state.rectX = rect.left
        state.rectY = rect.top
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

        // Before arming this sits at 0, which parks the front short of the
        // nearest row — the pass still runs, but paints nothing.
        //
        // Eased in and out rather than out only. A directional sweep wants a
        // roughly constant rate through the middle; an ease-out front covers
        // three quarters of the band in the first quarter of the duration and
        // then crawls, which reads as the reveal finishing early and stalling.
        const elapsedMs = state.armed ? elapsed * 1000 : 0
        const rt = Math.min(1, elapsedMs / ENTRANCE_MS)
        const reveal = state.reduced ? 1 : rt * rt * (3 - 2 * rt)

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
        f32[18] = g.revealFrom
        f32[19] = g.revealTo
        f32[20] = REVEAL_SOFT
        f32[21] = FALLOFF_POW
        f32[22] = EDGE_FADE
        f32[23] = SIDE_MIN
        f32[24] = SIDE_POW
        f32[25] = state.dark ? 0 : 1
        f32[26] = INTENSITY
        f32[27] = CREST_BOOST
        f32[28] = FAR_DIM

        // --- pointer ball ---------------------------------------------------
        // dt is clamped: a tab that was backgrounded, or a dropped frame under
        // load, must not let the ball take one enormous step. On the first frame
        // after the loop restarts lastFrame is 0 and dt is 0, so nothing moves
        // until there is a real interval to move over.
        const dt = state.lastFrame ? Math.min(100, nowMs - state.lastFrame) : 0
        state.lastFrame = nowMs

        // The pointer only reports while it moves, so a cursor parked over the
        // band is indistinguishable from one that left; BALL_HOLD_MS is the
        // backstop that keeps the bulge from becoming a permanent dent.
        let target: { gx: number; gz: number } | null = null
        if (
          !state.reduced &&
          state.pointerLive &&
          nowMs - state.pointerAt < BALL_HOLD_MS
        ) {
          const halfCW = canvas.width / 2
          const halfCH = canvas.height / 2
          const ndcX =
            ((state.pointerX - state.rectX) * state.dpr - halfCW) / halfCW
          const ndcY =
            (halfCH - (state.pointerY - state.rectY) * state.dpr) / halfCH
          target = planeHit(ndcX, ndcY, aspect, g)
        }

        // How much of the ball survives running off the edge of the lattice. The
        // pointer lives on the window, not on the 200px band, so the hit point
        // spends most of its time outside the grid: above the band the ray
        // strikes the plane past its near edge, below it the hit races off
        // toward the horizon. Fading over the last few cells means the ball
        // rolls off the edge instead of vanishing at it.
        const margin = g.spacing * BALL_REACH
        const reach = (v: number, limit: number) =>
          Math.max(0, Math.min(1, (limit + margin - Math.abs(v)) / margin))

        let want = 0
        if (target) {
          want = reach(target.gz, g.halfD) * reach(target.gx, g.halfW)
          // Snap rather than ease when the ball is effectively absent, so it
          // fades up where the cursor is instead of streaking across the band
          // from wherever it was last parked.
          if (state.ballStrength < 0.01 || !state.ballPlaced) {
            state.ballX = target.gx
            state.ballZ = target.gz
            state.ballPlaced = true
          } else {
            state.ballX = ease(state.ballX, target.gx, BALL_EASE_MS, dt)
            state.ballZ = ease(state.ballZ, target.gz, BALL_EASE_MS, dt)
          }
        }
        // On a miss the centre is held where it was and only the strength
        // decays, so the ball sinks back into the plane in place.
        state.ballStrength = ease(
          state.ballStrength,
          want,
          want > state.ballStrength ? BALL_FADE_IN_MS : BALL_FADE_OUT_MS,
          dt
        )

        const ballR = g.spacing * BALL_RADIUS
        f32[29] = state.ballX
        f32[30] = state.ballZ
        f32[31] = ballR
        f32[32] = ballR * BALL_HEIGHT
        f32[33] = BALL_EDGE
        f32[34] = g.spacing * BALL_SPLAY
        f32[35] = BALL_FEATHER
        f32[36] = state.reduced ? 0 : state.ballStrength
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
        // So a resumed loop eases from a clean clock rather than integrating the
        // whole time the band spent scrolled away in one step.
        state.lastFrame = 0
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

      // The pointer is tracked on window rather than on the band, which is
      // pointer-events: none and would never see it. Storing client coordinates
      // and a timestamp only — no layout reads, no maths, no ray — keeps this
      // cheap on a handler that fires at the display's refresh rate; the
      // unprojection happens once per frame in render() instead.
      const onPointerMove = (e: PointerEvent) => {
        if (disposed || state.reduced) return
        state.pointerX = e.clientX
        state.pointerY = e.clientY
        state.pointerAt = performance.now()
        state.pointerLive = true
        // The loop is already running for the wave, so there is nothing to
        // kick here — the next frame picks the new position up.
      }
      window.addEventListener("pointermove", onPointerMove, { passive: true })
      registerCleanup(() =>
        window.removeEventListener("pointermove", onPointerMove)
      )

      // The band is pointer-events: none and the pointer is tracked on the
      // window, so there is no element to get a leave event from. `pointerout`
      // with a null relatedTarget is the document-level "the cursor left the
      // window" signal; blur covers alt-tabbing away mid-hover, where no pointer
      // event fires at all. Either way the ball fades out rather than freezing.
      const onPointerGone = (e: PointerEvent) => {
        if (e.relatedTarget === null) state.pointerLive = false
      }
      document.addEventListener("pointerout", onPointerGone)
      registerCleanup(() =>
        document.removeEventListener("pointerout", onPointerGone)
      )

      const onBlur = () => {
        state.pointerLive = false
      }
      window.addEventListener("blur", onBlur)
      registerCleanup(() => window.removeEventListener("blur", onBlur))

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
        // The reduced path draws one frame and stops, so an eased fade-out would
        // never get frames to run on — drop the ball outright instead.
        if (state.reduced) {
          state.ballStrength = 0
          state.pointerLive = false
        }
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
