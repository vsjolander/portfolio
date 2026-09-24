// Hero dot grid — a lattice of dots lying on a plane that is pitched away from
// the camera and *downward*, so it recedes toward a horizon below the band: the
// near rows sit at the top of the window, large and widely spaced, and the grid
// shrinks and tightens as it falls away toward the bottom.
//
// A long, low radial cosine runs outward from the centre of the plane, lifting
// the dots it passes along the plane's normal — so the wave is visible as real
// parallax, not just a brightness pulse. It is a single continuous sinusoid
// rather than a train of discrete crests, so dots rise and fall through it
// without any edge to cross: at a wavelength longer than the grid is deep,
// neighbouring rows are only ever a few degrees of phase apart.
//
// The entrance is alpha and nothing else. Dots never move: they sit in their
// lattice cells, already displaced to their place on the wave, and simply light
// up as a front sweeps backwards away from the camera — the nearest rows first,
// running off toward the horizon. The wave is running at full amplitude the whole time, including
// before anything is visible — so a dot is already at the right height, moving
// at the right speed, at the instant it becomes visible. Easing the wave in
// after the reveal instead would pick up dots that had already lit and shove
// them off the plane, which is exactly the transition there is no way to hide.
//
// Two masks from the original glow survive: dots fade toward the left/right
// screen edges, and they fade toward the bottom of the band (which hides the
// horizon line, where the lattice would otherwise collapse into a hard bar).
//
// Dots are a single flat colour — white on dark backgrounds, near-black on
// light ones. Depth is carried entirely by alpha rather than by a colour ramp:
// ramping toward a mid stop is what makes a white dot read as grey, so the far
// rows just get thinner instead.
//
// Moving the pointer over the band slides a saucer under the lattice: a squashed
// disc of fixed world radius rides on the plane at the point the cursor's ray
// meets it, and the dots it passes under ride up over its hull and splay
// slightly outward, so the grid drapes over it like fabric. Its cross-section is
// a superellipse rather than a circle — flat across the middle, falling away
// near the rim — which is what reads as a disc instead of a ball.
//
// The radius is in world units, not pixels, and that is the whole point of it.
// The disc is one object of one size, so perspective shrinks its footprint with
// depth on its own: hovering the far rows makes a visibly smaller bulge than
// hovering the near ones, exactly as a real object under a receding sheet would.
// A radius in device pixels did the opposite — the far rows are crushed to a
// sliver, so a fixed screen circle dragged dozens of far cells around while
// barely touching the near ones.
//
// The centre eases toward the cursor rather than snapping to it, so the ball
// travels with a little inertia and settles rather than teleporting.
//
// Geometry is one instanced quad per dot. Everything — grid placement, the
// wave, the projection, the masks — happens in the vertex shader, so the
// fragment shader only has to draw an antialiased disc.

struct Uniforms {
  // Canvas size in device pixels.
  resolution : vec2f,
  // Seconds since the entrance armed. The wave runs off this from the very
  // first frame, reveal or no reveal.
  time : f32,
  // Reveal progress, 0 -> 1. Drives the radius of the light-up front.
  reveal : f32,
  // Canvas width / height.
  aspect : f32,

  // --- camera ------------------------------------------------------------
  // Pitch of the plane, in radians. 0 = a wall facing the camera; pi/2 = a
  // floor seen edge-on. Values near 1.1-1.3 give a strong receding table.
  tilt : f32,
  // Distance from the camera to the centre of the plane, along view Z.
  // Smaller = wider FOV = stronger perspective.
  camDist : f32,
  // Height of the plane's centre in view space. Solved on the CPU together
  // with `focal` so the plane's near and far edges land exactly on the top and
  // bottom of the band at any tilt.
  camY : f32,
  // Perspective focal length (NDC units per world unit at unit depth).
  focal : f32,

  // --- lattice -----------------------------------------------------------
  // Dots per row. The instance index is decomposed against this.
  cols : f32,
  // Distance between neighbouring dots, in world units. Uniform in both axes,
  // so the lattice is square on the plane and only perspective makes the far
  // rows look tighter.
  spacing : f32,
  // Half-extent of the lattice along the plane's depth axis. The projection is
  // solved for +-1, so anything past that is deliberate overscan.
  halfD : f32,
  // Dot radius in world units (at the plane, before perspective).
  dotRadius : f32,
  // Floor on a dot's drawn radius, in device pixels. See the note in the vertex
  // shader — below about a pixel a disc cannot be rasterised honestly, so it is
  // held at this size and paid for in alpha instead.
  dotMinPx : f32,

  // --- wave --------------------------------------------------------------
  // How fast crests travel outward, world units per second.
  waveSpeed : f32,
  // Distance between successive crests. Longer than the lattice is deep means
  // the whole visible grid is well under one full cycle apart in phase, which
  // is what makes the motion read as one slow swell instead of ripples.
  waveLength : f32,
  // Peak lift along the plane normal, in world units.
  waveAmp : f32,
  // Exponential decay of the lift with radius, so rings flatten out as they
  // reach the edges of the lattice rather than marching on at full height.
  waveDecay : f32,

  // --- entrance ----------------------------------------------------------
  // Where the sweep starts and ends, in the same units as `depthScreen` in the
  // vertex shader: 0 is the plane's near edge at the top of the band, 1 its far
  // edge at the bottom, and the overscan rows fall outside that. Solved on the
  // CPU from the projection so the front always clears both ends of the
  // lattice, whatever TILT and GRID_OVERSCAN are.
  revealFrom : f32,
  revealTo : f32,
  // Width of the front's soft edge, as a fraction of the band's height. This is
  // what each dot actually fades over — a wider edge means a longer, gentler
  // individual fade-up and a softer leading edge; 0 would switch rows on
  // instantly, a row at a time.
  revealSoft : f32,

  // --- masks -------------------------------------------------------------
  // Exponent of the fade toward the bottom of the band, where the plane falls
  // away to its horizon. >1 keeps the near rows solid and dissolves the far
  // ones quickly.
  falloffPow : f32,
  // Height of the fade at the very top edge, in 0..1 of the band. The near rows
  // overshoot the band and are clipped there, so this keeps them from ending on
  // a hard cut right under the nav.
  edgeFade : f32,
  // How bright the left/right screen edges stay (0 = fully faded out).
  sideMin : f32,
  // Exponent of the horizontal decay. >1 tightens the grid toward the centre.
  sidePow : f32,

  // --- shading -----------------------------------------------------------
  // 0 = white dots (dark theme), 1 = near-black dots (light theme).
  flip : f32,
  // Dot brightness multiplier. Deliberately allowed above 1: the result is
  // clamped, so anything over 1 widens the region that reaches *full* white
  // rather than making it brighter. This is the knob that stops the grid
  // reading as grey — with several falloffs multiplied together, an unboosted
  // dot mid-band lands near 10% alpha, and 10% white over a dark page is grey.
  intensity : f32,
  // Extra brightness on dots riding a ring crest, 0 = none.
  crestBoost : f32,
  // Alpha of the furthest row relative to the nearest, 0..1. This is what used
  // to be a colour ramp toward the palette's dark stop.
  farDim : f32,

  // --- pointer ball ------------------------------------------------------
  // Centre of the ball in the plane's OWN 2D coordinates — the same (gx, gz)
  // the lattice is laid out in, not screen pixels. The screen-to-plane
  // unprojection depends only on the pointer and the camera, never on which dot
  // is being shaded, so it is solved once per frame on the CPU and arrives here
  // already in plane space. That is also what makes it survive a resize: plane
  // coordinates do not care about the aspect ratio.
  ballX : f32,
  ballZ : f32,
  // Radius of the ball, in WORLD units. A fixed world radius is what makes the
  // projection shrink the ball's on-screen footprint with depth on its own.
  ballRadius : f32,
  // Peak lift at the disc's centre, along the plane normal, in world units.
  // Equal to ballRadius would be a true hemisphere; well under it is what makes
  // this a saucer rather than a ball.
  ballHeight : f32,
  // Profile exponent of the superellipse cross-section, (1 - dn^e)^(1/e).
  // 2 is exactly a sphere; higher flattens the top and pulls the falloff out
  // toward the rim, which is what gives the disc its hull.
  ballEdge : f32,
  // Outward in-plane splay scale, in world units.
  ballSplay : f32,
  // Fraction of the radius at which the rim feather begins, 0..1. Inside it the
  // surface is exactly spherical; outside it the skirt is eased away.
  ballFeather : f32,
  // Master 0..1 fade. 0 removes the ball entirely, which is what reduced
  // motion, a pointer that has left the window, a stale pointer and a ray that
  // misses the plane all resolve to.
  ballStrength : f32,
};

@group(0) @binding(0) var<uniform> U : Uniforms;

// Dot colours in sRGB 0..1, written straight to the (non-sRGB) canvas.
// Pure white on dark backgrounds; the palette's darkest stop on light ones.
const DOT_ON_DARK : vec3f = vec3f(1.0, 1.0, 1.0);
const DOT_ON_LIGHT : vec3f = vec3f(0.054902, 0.098039, 0.117647); // #0E191E

const TAU : f32 = 6.2831853;

struct VSOut {
  @builtin(position) pos : vec4f,
  // Position within the dot's quad, -1..1 on both axes. The disc is carved
  // out of this in the fragment shader.
  @location(0) uv : vec2f,
  @location(1) colour : vec3f,
  @location(2) alpha : f32,
  // Width of the antialiased rim, in uv units. Derived from the dot's on-screen
  // radius so far (tiny) dots stay soft instead of aliasing into flicker.
  @location(3) edge : f32,
};

// Perspective projection shared by the two passes below: xy is the clip-space
// position, z the scale factor that shrinks distant geometry.
fn project(world : vec3f) -> vec3f {
  // Clamped so a dot pushed past the camera plane collapses instead of
  // wrapping around behind it.
  let vz = max(world.z, 0.05);
  let scale = U.focal / vz;
  return vec3f(world.x * scale / U.aspect, world.y * scale, scale);
}

// Displacement of the radial wave at radius `r`, -1..1.
//
// A plain travelling sinusoid: phase advances with time and retreats with
// radius, so crests move outward at waveSpeed. Being one continuous curve, it
// has no rim, no seam and no discrete rings — every dot is always somewhere on
// a smooth slope.
//
// It has no envelope and no leading edge: the wave is fully formed everywhere,
// at every moment, from the first frame. That is what makes the entrance
// seamless — the reveal only decides which dots you can *see*, never where they
// are, so nothing is ever in the wrong place when it appears.
//
// It is signed, so dots dip below the plane as well as rise above it.
fn radialWave(r : f32) -> f32 {
  let phase = (U.time * U.waveSpeed - r) * TAU / max(U.waveLength, 1e-4);
  return sin(phase);
}

@vertex
fn vs(
  @builtin(vertex_index) vi : u32,
  @builtin(instance_index) ii : u32,
) -> VSOut {
  // --- lattice placement -------------------------------------------------
  // Instances are laid out far row first, so nearer dots are drawn later and
  // win the overlap. There is no depth buffer; draw order is the sort.
  let cols = max(u32(U.cols), 1u);
  let ix = f32(ii % cols);
  let iz = f32(ii / cols);
  let gx = (ix - (U.cols - 1.0) * 0.5) * U.spacing;
  let gz = U.halfD - iz * U.spacing;

  // Radius from the centre of the plane, measured on the plane itself — so the
  // rings are true circles in world space and perspective is what turns them
  // into the ellipses you actually see.
  let r = length(vec2f(gx, gz));

  // --- wave --------------------------------------------------------------
  let wave = radialWave(r) * exp(-r * U.waveDecay);
  let lift = wave * U.waveAmp;

  // --- plane basis -------------------------------------------------------
  // The plane is pitched about X. At tilt 0 it is a wall in XY with its normal
  // pointing at the camera; as tilt grows it tips away into a plane that falls
  // *downward* as it recedes, and the normal swings downward with it — which is
  // exactly why the lift becomes visible as vertical parallax rather than as
  // pure scale.
  //
  // The bitangent's negative Y is what puts the near rows at the top of the
  // window: depth runs down the screen, not up, so the horizon ends up below
  // the band rather than above it. Flip its sign (and camY's, on the CPU) to
  // turn the plane back into a floor receding upward.
  let ct = cos(U.tilt);
  let st = sin(U.tilt);
  let tangent = vec3f(1.0, 0.0, 0.0);
  let bitangent = vec3f(0.0, -ct, st);
  let normal = vec3f(0.0, -st, -ct);
  let centre = vec3f(0.0, U.camY, U.camDist);
  let baseWorld = centre + tangent * gx + bitangent * gz + normal * lift;

  // --- pointer ball ------------------------------------------------------
  // Measured from the dot's UNDISTORTED cell, for the same reason the old
  // screen-space wake was: driving the influence from the displaced position
  // feeds back on itself. A dot that rode up the ball would move out of the
  // ball's footprint, lose the lift that put it there, drop home, and be lifted
  // again — the whole field would boil. `gx` and `gz` never move, so the bulge
  // is stable no matter how far a dot is thrown.
  //
  // 2D IN-PLANE distance, deliberately, even though the orthonormal basis makes
  // the true 3D distance available as length(vec3f(gx - ballX, gz - ballZ,
  // lift)). sqrt(R^2 - d^2) is by definition the height of the sphere's surface
  // above the plane at in-plane offset d; feeding it a 3D distance would
  // describe a smaller sphere, not this one. It would also make the rim
  // breathe: the wave lift runs to half the ball's radius, so a 3D gate would
  // shrink the footprint as a crest passed and dots near the rim would flicker
  // in and out at the wave's frequency.
  let toBall = vec2f(gx - U.ballX, gz - U.ballZ);
  let dBall = length(toBall);
  let dn = min(dBall / max(U.ballRadius, 1e-5), 1.0);

  // Normalised surface height: 1 at the centre, 0 at the rim.
  //
  // A superellipse cross-section, (1 - dn^e)^(1/e), rather than a circle. At
  // e = 2 the two are identical and this is a sphere; raising e flattens the
  // middle and holds the height out toward the edge before dropping it, which
  // is the difference between a ball under the sheet and a saucer with a hull.
  // The exponent is the shape dial and the height is the squash — together they
  // are what make the lattice drape over a disc rather than a dome.
  let e = max(U.ballEdge, 1.0);
  let dome = pow(max(1.0 - pow(dn, e), 0.0), 1.0 / e);

  // The profile has a vertical tangent at the rim — more so the flatter the
  // disc — so a dot crossing it takes an abrupt jolt and visibly pops. Fading
  // the outer shell out with a smoothstep fixes it without rounding the hull
  // off: inside `ballFeather` the surface is exactly the superellipse, and
  // across the skirt both value and slope are eased to zero. The min() guards
  // the degenerate smoothstep(1, 1, x), which WGSL leaves undefined.
  let rim = 1.0 - smoothstep(min(U.ballFeather, 0.99), 1.0, dn);
  let grip = rim * U.ballStrength;

  // Up and over the disc, along the plane's normal. That normal points back
  // toward the camera, so a positive lift is a hull pushing up *under* the
  // lattice from the viewer's side, not a dent. This ADDS to the wave lift
  // already baked into baseWorld, so the disc reads as an object under a sheet
  // that is itself still swelling.
  let ballLift = U.ballHeight * dome * grip;

  // A little outward splay, so the lattice reads as stretched over the hull
  // rather than merely lifted off it. Zero at the centre (there is no direction
  // there) and zero at the rim; in between it follows dn * dome, which for a
  // flat profile puts the push out near the edge where the hull is steepest.
  // ballSplay scales that curve rather than being an exact maximum, since the
  // curve's peak moves with `ballEdge`. A real inextensible sheet would pull
  // dots *inward*; outward is the reading we want, and a negative ballSplay
  // gives the other one.
  let splayDir = select(vec2f(0.0), toBall / max(dBall, 1e-5), dBall > 1e-5);
  let splay = splayDir * (U.ballSplay * dn * dome * grip);

  let world = baseWorld
    + tangent * splay.x
    + bitangent * splay.y
    + normal * ballLift;

  // --- projection --------------------------------------------------------
  // Camera sits at the origin looking down +Z.
  let projected = project(world);
  let ndc = projected.xy;
  let scale = projected.z;

  // Perspective-correct dot size: the same world radius covers fewer pixels
  // the further away it is, which is what sells the recession. The ball moves
  // dots and nothing else — their size is left alone.
  let rY = U.dotRadius * scale;

  // Radius the dot wants, in device pixels, and the radius it will actually be
  // drawn at.
  //
  // Below roughly a pixel a disc cannot be rasterised honestly: whether it
  // happens to cover a sample point is luck, so as the grid drifts a field of
  // sub-pixel dots scintillates, individual dots blinking in and out. Holding
  // the quad at a floor and paying for the extra size with alpha — in
  // proportion to the area the dot should have had — keeps each dot's total ink
  // correct while giving the rasteriser something it can resolve. The far rows
  // then fade smoothly into haze instead of sparkling.
  let wantPx = max(rY * 0.5 * U.resolution.y, 1e-4);
  let drawPx = max(wantPx, U.dotMinPx);
  let shrink = wantPx / drawPx;
  let sizeAlpha = shrink * shrink;

  let rD = rY * (drawPx / wantPx);
  let corner = vec2f(f32(vi & 1u), f32((vi >> 1u) & 1u)) * 2.0 - 1.0;

  // --- masks -------------------------------------------------------------
  // Horizontal: measured in screen space, so it tracks the window edges rather
  // than the lattice, and stays put as the plane's world extent changes.
  let sx = clamp(abs(ndc.x), 0.0, 1.0);
  let side = mix(U.sideMin, 1.0, pow(1.0 - sx, U.sidePow));

  // Vertical position down the plane, taken from the projected result rather
  // than from gz: 0 at the plane's near edge (the top of the band), 1 at its far
  // edge (the bottom), and outside that range in the overscan.
  //
  // Screen space, not world depth, is what the sweep below wants. Perspective
  // crushes the far half of the lattice into a sliver, so a front advancing at a
  // constant rate through world depth would clear everything you can actually
  // see in the first third of the entrance and then spend the rest crawling
  // through rows a pixel tall that are already faded to nothing. This is still
  // strictly depth-ordered — it is a monotonic reparametrisation of gz — so the
  // reveal really does run from the closest row backwards.
  let depthScreen = 0.5 - ndc.y * 0.5;

  // 1 at the top of the band, which is the *near* end of the plane, falling to
  // 0 at the bottom, which is the far end.
  let nearness = clamp(1.0 - depthScreen, 0.0, 1.0);
  // Fade toward the far end at the bottom, where the lattice would otherwise
  // pile up into a hard bar as it approaches the horizon.
  let depthFade = pow(nearness, U.falloffPow);
  // Soften the top edge, where the near rows overshoot the band and are clipped.
  let nearEdge = smoothstep(0.0, max(U.edgeFade, 1e-4), 1.0 - nearness);

  // --- entrance ----------------------------------------------------------
  // The front runs from just short of the nearest row to a soft edge's width
  // past the furthest, so every dot both starts fully dark and finishes fully
  // lit — no row is left caught mid-fade when reveal reaches 1. The dot is
  // already sitting at its wave height before the front arrives: only its alpha
  // moves, never its position.
  let front = mix(U.revealFrom, U.revealTo + U.revealSoft, U.reveal);
  let appear = 1.0 - smoothstep(front - U.revealSoft, front, depthScreen);

  // --- shading -----------------------------------------------------------
  // Flat colour, so a dot is the full ink of the theme and never a blend
  // toward some mid grey. Every falloff below acts on alpha instead, which
  // over a premultiplied composite is what keeps near dots reading as white.
  let colour = mix(DOT_ON_DARK, DOT_ON_LIGHT, U.flip);

  // 0 on the near edge, 1 on the far edge — thins the far rows. gz runs from
  // +halfD at the far edge down to -halfD at the near one, so it is (gz + halfD)
  // that grows with distance, not (halfD - gz).
  let depthT = clamp((gz + U.halfD) / max(2.0 * U.halfD, 1e-4), 0.0, 1.0);
  let depthDim = mix(1.0, U.farDim, depthT);

  // Only the two *depth* terms are boosted and clamped. They are a tonal
  // gradient, so saturating them is what turns the grid white; the crest rides
  // along because a lit dot cannot get whiter than white. Only the wave's
  // positive half brightens — troughs are dips, not shadows.
  let core = clamp(
    U.intensity * depthFade * depthDim * (1.0 + max(wave, 0.0) * U.crestBoost),
    0.0,
    1.0
  );

  // The three envelopes stay outside the boost, so each still covers its full
  // 0..1 range. Folding them in would scale their soft edges down by the boost
  // factor: the screen-edge mask would stop reaching 0 and start showing dots
  // at the window edges, and the reveal front's soft edge would compress to a
  // third of its width and snap dots on.
  let alpha = core * side * nearEdge * appear * sizeAlpha;

  var out : VSOut;
  out.pos = vec4f(ndc + corner * vec2f(rD / U.aspect, rD), 0.0, 1.0);
  out.uv = corner;
  out.colour = colour;
  out.alpha = alpha;
  // Antialiasing width, taken from the drawn radius so it is roughly one pixel
  // however far away the dot is. A floored dot ends up at edge 1, i.e. a soft
  // blob with no hard rim at all — which is the right look at that size.
  out.edge = clamp(1.0 / drawPx, 0.05, 1.0);
  return out;
}

// Coverage of the unit disc at `q`, softened by `edge` so small dots stay smooth.
fn disc(q : vec2f, edge : f32) -> f32 {
  return 1.0 - smoothstep(1.0 - edge, 1.0, length(q));
}

@fragment
fn fs(in : VSOut) -> @location(0) vec4f {
  // One disc, carved straight out of the quad's -1..1 uv. The quad is no longer
  // inflated past the dot, so uv is already in dot-radius units.
  let a = in.alpha * disc(in.uv, in.edge);
  // Premultiplied: the context is configured alphaMode "premultiplied" and the
  // blend is (one, one-minus-src-alpha), so rgb must already carry its own
  // coverage.
  return vec4f(in.colour * a, a);
}
