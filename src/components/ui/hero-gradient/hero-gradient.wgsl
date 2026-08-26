// Hero glow — a soft glow blooming from the top-centre of the window. It grows
// downward as the entrance plays, peaks at the top edge and horizontal centre,
// and falls off toward the bottom and the left/right screen edges. Over that
// base envelope a slow, low-frequency diagonal "sheen" drifts across, so the
// light reads like a soft caustic streak rather than a static bloom. A fine
// per-pixel grain adds texture.
//
// The palette (dark -> mid -> light) is fixed. Only its *direction* swaps with
// the theme: on dark backgrounds the brightest stop sits at the top (a light
// glow fading into the dark page); on light backgrounds the darkest stop sits
// at the top (a dark wash fading into the light page).

struct Uniforms {
  // Canvas size in device pixels.
  resolution : vec2f,
  // Seconds since the entrance armed. Drives the sheen drift.
  time : f32,
  // Entrance progress, 0 -> 1. Scales the band's depth so it unfurls downward.
  entrance : f32,
  // Full band depth in device pixels (the height at entrance == 1).
  depthMax : f32,
  // 0 = brightest stop at the top (dark theme), 1 = darkest at the top (light).
  flip : f32,
  // Exponent of the vertical decay. >1 pulls the glow up toward the top edge.
  falloffPow : f32,
  // How bright the left/right screen edges stay (0 = fully dark).
  sideMin : f32,
  // Exponent of the horizontal decay. >1 tightens the glow toward the centre.
  sidePow : f32,
  // Grain cell size in device pixels. 1 is per-pixel grain; larger is chunkier.
  noiseScale : f32,
  // Grain strength, 0 (off) .. 1 (heavy).
  noiseAmount : f32,
  // Overall glow brightness multiplier.
  glowIntensity : f32,
  // Strength of the blue-green tint blended into the darker end, 0..1.
  tintAmount : f32,
  // How sharply the tint ramps in toward the dark end.
  tintPow : f32,
  // Diagonal sheen: orientation in radians.
  sheenAngle : f32,
  // Diagonal sheen: spatial frequency (soft ridges across the band).
  sheenFreq : f32,
  // Diagonal sheen: drift speed.
  sheenSpeed : f32,
  // Diagonal sheen: floor in its darkest trough, 0..1.
  sheenMin : f32,
  // Diagonal sheen: contrast exponent.
  sheenPow : f32,
  _pad : f32,
};

@group(0) @binding(0) var<uniform> U : Uniforms;

// Palette in sRGB 0..1, written straight to the (non-sRGB) canvas.
const C0 : vec3f = vec3f(0.054902, 0.098039, 0.117647); // #0E191E
const C1 : vec3f = vec3f(0.733333, 0.788235, 0.780392); // #BBC9C7
const C2 : vec3f = vec3f(0.874510, 0.917647, 0.909804); // #DFEAE8
// Blue-green hue push, roughly luminance-preserving (its own luminance ~1), so
// tinting shifts hue rather than brightness. Red is cut, green/blue lifted.
const TINT_BIAS : vec3f = vec3f(0.55, 1.08, 1.05);

@vertex
fn vs(@builtin(vertex_index) i : u32) -> @builtin(position) vec4f {
  // Single oversized triangle covering the clip volume.
  var p = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  return vec4f(p[i], 0.0, 1.0);
}

// White-noise hash, 0..1. Independent per input cell, which is what makes the
// grain read as grain rather than smooth cloud.
fn hash2(p : vec2f) -> f32 {
  var p3 = fract(vec3f(p.x, p.y, p.x) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Smooth 3-stop ramp: t 0 -> C0, 0.5 -> C1, 1 -> C2.
fn ramp3(t : f32) -> vec3f {
  let x = clamp(t, 0.0, 1.0) * 2.0;
  if (x < 1.0) {
    return mix(C0, C1, smoothstep(0.0, 1.0, x));
  }
  return mix(C1, C2, smoothstep(0.0, 1.0, x - 1.0));
}

@fragment
fn fs(@builtin(position) frag : vec4f) -> @location(0) vec4f {
  // Device pixels, y increasing downward from the top edge of the band.
  let px = frag.xy;

  // Depth grows from the top edge as the entrance plays, so the glow unfurls
  // downward rather than fading in flat.
  let depth = max(U.depthMax * U.entrance, 1.0);
  // 0 at the top edge, 1 at the bottom of the grown band.
  let v = clamp(px.y / depth, 0.0, 1.0);
  // 0..1 across the window width.
  let u = px.x / max(U.resolution.x, 1.0);

  // Vertical glow profile: brightest at the top, easing to nothing at the
  // bottom of the grown band.
  let vert = pow(1.0 - v, U.falloffPow);

  // Horizontal glow profile: brightest at the centre, falling toward the
  // left/right edges but never below sideMin.
  let cx = 1.0 - abs(u - 0.5) * 2.0;
  let horiz = pow(clamp(cx, 0.0, 1.0), U.sidePow);
  let side = mix(U.sideMin, 1.0, horiz);

  // Diagonal sheen: soft light/dark ridges along `sheenAngle`, drifting slowly
  // with time. Two offset waves keep it from reading as a mechanical stripe.
  // Sampled in aspect-corrected, height-normalised space.
  let asp = U.resolution.x / max(U.resolution.y, 1.0);
  let p = vec2f(u * asp, px.y / max(U.resolution.y, 1.0));
  let d = p.x * cos(U.sheenAngle) + p.y * sin(U.sheenAngle);
  let s1 = sin(d * U.sheenFreq - U.time * U.sheenSpeed);
  let s2 = sin(d * U.sheenFreq * 0.6 + U.time * U.sheenSpeed * 0.7 + 1.3);
  let wave = clamp(0.5 + 0.25 * s1 + 0.25 * s2, 0.0, 1.0);
  let sheen = mix(U.sheenMin, 1.0, pow(wave, U.sheenPow));

  // Grain: an independent random value per grain cell, centred on 1 so it
  // lightens and darkens the glow in equal measure.
  let g = hash2(floor(px / max(U.noiseScale, 1.0)));
  let tex = 1.0 + (g - 0.5) * U.noiseAmount;

  // Colour position along the palette — brightest stop at the top on dark
  // themes, darkest at the top on light ones.
  let t = mix(1.0 - v, v, U.flip);
  var col = ramp3(t);

  // Push a blue-green tint into the darker end of the ramp (t -> 0), preserving
  // luminance so it reads as a hue shift rather than a brightness change.
  let tintW = pow(1.0 - t, U.tintPow) * U.tintAmount;
  let lum = dot(col, vec3f(0.2126, 0.7152, 0.0722));
  col = mix(col, lum * TINT_BIAS, tintW);

  // Premultiplied — the glow's own profile is its alpha, so it composites over
  // the page background and fades into it toward the bottom and edges.
  let alpha =
    clamp(vert * side * sheen * U.glowIntensity * tex, 0.0, 1.0);
  return vec4f(col * alpha, alpha);
}
