// Hero gradient — a soft band of drifting colour ribbons hanging from the top
// edge of the window. Colours come from a cyclic 5-stop ramp driven by a
// domain-warped fbm field; the band's depth sags toward the horizontal centre
// and its alpha decays with distance from the top edge.

struct Uniforms {
  // Canvas size in device pixels.
  resolution : vec2f,
  // Seconds since mount. Frozen when the visitor prefers reduced motion.
  time : f32,
  // Entrance progress, 0 -> 1 over ~1.2s. Scales the band's depth so it
  // unfurls downward rather than fading in flat.
  entrance : f32,
  // Width of one ribbon in device pixels. Derived on the CPU by clamping the
  // ribbon count to 3..7 across the viewport, so a phone never shows a single
  // undifferentiated wash and an ultrawide never shows four 600px slabs.
  ribbonSize : f32,
  // Depth in device pixels at which alpha reaches 0, at the horizontal centre.
  depthMax : f32,
  // Exponent of the vertical alpha decay. >1 weights opacity toward the top.
  falloffPow : f32,
  _pad : f32,
  // Ramp stops in *linear* RGB. Cyclic: stop 4 blends back into stop 0, which
  // is what lets the field be sampled with fract() without a seam.
  stops : array<vec4f, 5>,
};

@group(0) @binding(0) var<uniform> U : Uniforms;

const TAU : f32 = 6.28318530718;
// Ribbon direction. ~22deg rather than the reference's 45deg — on a band this
// wide and shallow a true diagonal only ever shows one or two crossings.
const THETA : f32 = 0.384;

@vertex
fn vs(@builtin(vertex_index) i : u32) -> @builtin(position) vec4f {
  // Single oversized triangle covering the clip volume; cheaper than a quad
  // and avoids the diagonal seam two triangles would introduce.
  var p = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  return vec4f(p[i], 0.0, 1.0);
}

fn hash2(p : vec2f) -> f32 {
  var p3 = fract(vec3f(p.x, p.y, p.x) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

fn vnoise(p : vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let a = hash2(i);
  let b = hash2(i + vec2f(1.0, 0.0));
  let c = hash2(i + vec2f(0.0, 1.0));
  let d = hash2(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

fn fbm(p0 : vec2f) -> f32 {
  var p = p0;
  var amp = 0.5;
  var sum = 0.0;
  for (var i = 0; i < 4; i++) {
    sum += amp * vnoise(p);
    p = p * 2.02 + vec2f(11.7, 3.1);
    amp *= 0.5;
  }
  return sum;
}

// Cyclic lookup into the 5 stops, smoothstepped between neighbours.
fn ramp(t : f32) -> vec3f {
  let x = fract(t) * 5.0;
  let i = u32(floor(x)) % 5u;
  let j = (i + 1u) % 5u;
  let f = fract(x);
  let s = f * f * (3.0 - 2.0 * f);
  return mix(U.stops[i].rgb, U.stops[j].rgb, s);
}

fn linearToSrgb(c : vec3f) -> vec3f {
  let x = max(c, vec3f(0.0));
  let lo = x * 12.92;
  let hi = 1.055 * pow(x, vec3f(1.0 / 2.4)) - 0.055;
  return select(hi, lo, x <= vec3f(0.0031308));
}

@fragment
fn fs(@builtin(position) frag : vec4f) -> @location(0) vec4f {
  // Device pixels, y increasing downward from the top edge of the band.
  let px = frag.xy;

  // Sample the noise in ribbon units on *both* axes so ribbons stay square in
  // noise space — the band is a letterbox slot onto a much larger field rather
  // than a stretched copy of it.
  let q = px / U.ribbonSize;
  let t = U.time;

  // Two-pass domain warp: the second fbm is displaced by the first, which is
  // what makes the ribbon count breathe instead of marching at fixed spacing.
  let w1 = fbm(q * 0.55 + vec2f(t * 0.07, t * -0.04));
  let w2 = fbm(q * 0.90 + vec2f(w1 * 1.6, -w1 * 1.1) + vec2f(-t * 0.05, t * 0.03));

  let dir = vec2f(cos(THETA), sin(THETA));
  let field = dot(q, dir) * 0.85 + w2 * 1.5 + t * 0.06;

  // --- Shape ---------------------------------------------------------------
  let u = px.x / max(U.resolution.x, 1.0);
  // 0 at the left/right edges, 1 at the horizontal centre.
  let centre = 0.5 - 0.5 * cos(TAU * u);

  // The band sags: full depth at centre, 60% of it at the side edges.
  let depth = U.depthMax * (0.6 + 0.4 * centre) * U.entrance;
  let d = clamp(px.y / max(depth, 1.0), 0.0, 1.0);
  let vertical = pow(1.0 - d, U.falloffPow);

  // Taper toward the corners so the top edge blooms from centre rather than
  // slamming a full-strength colour bar against the browser chrome.
  let corners = 0.5 + 0.5 * centre;

  var alpha = vertical * corners * clamp(U.entrance * 1.5, 0.0, 1.0);

  // --- Output --------------------------------------------------------------
  var col = linearToSrgb(ramp(field));

  // Triangular-PDF dither at +/- 1/255. Without it an 8-bit ramp this slow and
  // this wide bands visibly, especially through the near-transparent tail.
  let dither = (hash2(px) + hash2(px + vec2f(19.7, 7.3)) - 1.0) / 255.0;
  col += vec3f(dither);
  alpha = clamp(alpha + dither, 0.0, 1.0);

  // Premultiplied — the canvas is configured to composite that way over the
  // page background, which is what makes the alpha tail work in both themes.
  return vec4f(clamp(col, vec3f(0.0), vec3f(1.0)) * alpha, alpha);
}
