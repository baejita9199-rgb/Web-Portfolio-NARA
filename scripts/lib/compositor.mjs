/**
 * A very small declarative image compositor.
 *
 * It exists so every placeholder in this project is generated from the same
 * palette and the same handful of light behaviours — gradients, mist bands,
 * window shafts, terrain masses — rather than being a random blur. That is what
 * lets a page full of placeholders still read as one art direction.
 *
 * Layers are evaluated per pixel at low resolution and upscaled afterwards; the
 * output is smooth by nature so nothing is lost, and it keeps generation fast
 * enough to render several hundred video frames.
 */

export const PALETTE = {
  ricePaper: [241, 237, 228],
  warmSand: [215, 203, 185],
  clayBrown: [140, 114, 93],
  forestGreen: [53, 70, 60],
  charcoal: [36, 36, 33],
  softWhite: [248, 246, 240],
  // Two intermediates that only exist to give the gradients somewhere to sit
  // between the six brand colours.
  deepMoss: [40, 52, 44],
  duskClay: [96, 82, 70],
};

const clamp01 = (value) => (value < 0 ? 0 : value > 1 ? 1 : value);

function mix(a, b, t) {
  const k = clamp01(t);
  return [
    a[0] + (b[0] - a[0]) * k,
    a[1] + (b[1] - a[1]) * k,
    a[2] + (b[2] - a[2]) * k,
  ];
}

/** Smoothstep, used everywhere so no edge in the output is ever hard. */
function smooth(edge0, edge1, x) {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Cheap deterministic value noise — enough to break up a flat gradient. */
function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function valueNoise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);

  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);

  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x, y, octaves = 3) {
  let sum = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i += 1) {
    sum += valueNoise(x * frequency, y * frequency) * amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return sum;
}

/**
 * Evaluates one layer at normalised coordinates, returning `[colour, alpha]`.
 * `t` is the loop phase, 0…1, and every time-dependent term is expressed as a
 * full turn of sine or cosine so frame 0 and frame N are identical.
 */
function evaluateLayer(layer, u, v, t) {
  switch (layer.type) {
    case "linear": {
      const angle = ((layer.angle ?? 90) * Math.PI) / 180;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      // Project onto the gradient axis and renormalise to 0…1.
      const projected = (u - 0.5) * dx + (v - 0.5) * dy + 0.5;
      const drift = layer.drift ? Math.sin(t * Math.PI * 2) * layer.drift : 0;
      const p = clamp01(projected + drift);

      const stops = layer.stops;
      let colour = stops[0].color;
      for (let i = 0; i < stops.length - 1; i += 1) {
        const current = stops[i];
        const next = stops[i + 1];
        if (p >= current.at && p <= next.at) {
          const local = (p - current.at) / (next.at - current.at || 1);
          colour = mix(current.color, next.color, smooth(0, 1, local));
          break;
        }
        if (p > next.at) colour = next.color;
      }
      return [colour, 1];
    }

    case "radial": {
      const wobble = layer.drift
        ? Math.sin(t * Math.PI * 2 + (layer.phase ?? 0)) * layer.drift
        : 0;
      const dx = (u - (layer.cx ?? 0.5)) / (layer.rx ?? layer.r ?? 0.5);
      const dy = (v - (layer.cy ?? 0.5) + wobble) / (layer.ry ?? layer.r ?? 0.5);
      const distance = Math.sqrt(dx * dx + dy * dy);
      const alpha = (1 - smooth(0, 1, distance)) * (layer.strength ?? 0.5);
      return [layer.color, alpha];
    }

    case "band": {
      // A horizontal ribbon of mist, softened at both edges and free to drift
      // sideways and vertically over the loop.
      const phase = layer.phase ?? 0;
      const driftY = Math.sin(t * Math.PI * 2 + phase) * (layer.driftY ?? 0);
      const driftX = Math.cos(t * Math.PI * 2 + phase) * (layer.driftX ?? 0);
      const tilt = (layer.tilt ?? 0) * (u - 0.5);
      const centre = (layer.y ?? 0.5) + driftY + tilt;
      const half = (layer.height ?? 0.12) / 2;
      const distance = Math.abs(v - centre) / half;
      let alpha = (1 - smooth(0, 1, distance)) * (layer.strength ?? 0.4);

      if (layer.texture) {
        const n = fbm((u + driftX) * (layer.scale ?? 3), v * (layer.scale ?? 3));
        alpha *= 0.55 + n * 0.9;
      }
      return [layer.color, clamp01(alpha)];
    }

    case "shaft": {
      // A slab of light falling through an opening, angled and feathered.
      const angle = ((layer.angle ?? 78) * Math.PI) / 180;
      const drift = Math.sin(t * Math.PI * 2 + (layer.phase ?? 0)) * (layer.drift ?? 0);
      const axis = (u - (layer.x ?? 0.5) + drift) * Math.sin(angle) -
        (v - 0.5) * Math.cos(angle);
      const distance = Math.abs(axis) / ((layer.width ?? 0.18) / 2);
      const falloff = layer.falloff ? 1 - smooth(0, 1, v) * layer.falloff : 1;
      const alpha =
        (1 - smooth(0, 1, distance)) * (layer.strength ?? 0.35) * falloff;
      return [layer.color, clamp01(alpha)];
    }

    case "rect": {
      // A soft-edged rectangle — a window opening, a door, the line where the
      // floor meets the wall. It is what stops an interior reading as a blur.
      const drift = layer.drift
        ? Math.sin(t * Math.PI * 2 + (layer.phase ?? 0)) * layer.drift
        : 0;
      const feather = layer.feather ?? 0.04;
      const inX =
        smooth(layer.x0 + drift - feather, layer.x0 + drift + feather, u) *
        (1 - smooth(layer.x1 + drift - feather, layer.x1 + drift + feather, u));
      const inY =
        smooth(layer.y0 - feather, layer.y0 + feather, v) *
        (1 - smooth(layer.y1 - feather, layer.y1 + feather, v));
      return [layer.color, inX * inY * (layer.strength ?? 0.5)];
    }

    case "mass": {
      // A soft dark body rising from an edge: terrain, canopy, a wall in shade.
      const fromBottom = (layer.edge ?? "bottom") === "bottom";
      const coordinate = fromBottom ? 1 - v : v;
      const wave = layer.wave
        ? Math.sin(u * Math.PI * (layer.waveCount ?? 2) + (layer.phase ?? 0)) *
          layer.wave
        : 0;
      const edge = (layer.height ?? 0.3) + wave;
      const alpha =
        (1 - smooth(edge - (layer.feather ?? 0.12), edge, coordinate)) *
        (layer.strength ?? 1);
      return [layer.color, clamp01(alpha)];
    }

    case "grain": {
      // Large-scale tonal variation, not film grain — that is added at full
      // resolution later so it stays sharp.
      const n = fbm(
        u * (layer.scale ?? 4) + t * (layer.flow ?? 0),
        v * (layer.scale ?? 4),
        layer.octaves ?? 3,
      );
      const alpha = (n - 0.5) * 2 * (layer.strength ?? 0.1);
      return [layer.color, clamp01(Math.abs(alpha))];
    }

    case "vignette": {
      const dx = (u - 0.5) * 2;
      const dy = (v - 0.5) * 2;
      const distance = Math.sqrt(dx * dx + dy * dy) / Math.SQRT2;
      const alpha = smooth(layer.inner ?? 0.45, 1, distance) * (layer.strength ?? 0.3);
      return [layer.color ?? PALETTE.charcoal, alpha];
    }

    default:
      return [[0, 0, 0], 0];
  }
}

/**
 * Renders a recipe to a raw RGB buffer.
 *
 * @param {number} width
 * @param {number} height
 * @param {{base:number[], layers:object[]}} recipe
 * @param {number} t loop phase, 0…1
 */
export function renderRecipe(width, height, recipe, t = 0) {
  const buffer = Buffer.allocUnsafe(width * height * 3);
  const { base, layers } = recipe;

  for (let y = 0; y < height; y += 1) {
    const v = height === 1 ? 0 : y / (height - 1);
    for (let x = 0; x < width; x += 1) {
      const u = width === 1 ? 0 : x / (width - 1);

      let r = base[0];
      let g = base[1];
      let b = base[2];

      for (let i = 0; i < layers.length; i += 1) {
        const [colour, alpha] = evaluateLayer(layers[i], u, v, t);
        if (alpha <= 0) continue;
        const a = alpha > 1 ? 1 : alpha;
        r += (colour[0] - r) * a;
        g += (colour[1] - g) * a;
        b += (colour[2] - b) * a;
      }

      const offset = (y * width + x) * 3;
      buffer[offset] = r < 0 ? 0 : r > 255 ? 255 : r;
      buffer[offset + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
      buffer[offset + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
    }
  }

  return buffer;
}

/**
 * A tile of monochrome film grain as RGBA, meant to be composited over the
 * upscaled gradient. Alpha carries the strength so the tile can simply be
 * drawn with the default `over` blend.
 */
export function createGrainTile(size, strength, seed = 1) {
  const buffer = Buffer.allocUnsafe(size * size * 4);
  let state = seed * 2654435761;

  for (let i = 0; i < size * size; i += 1) {
    // xorshift — deterministic, so regenerating assets produces identical files.
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const n = ((state >>> 0) / 4294967295 - 0.5) * 2;

    const offset = i * 4;
    const value = n > 0 ? 255 : 0;
    buffer[offset] = value;
    buffer[offset + 1] = value;
    buffer[offset + 2] = value;
    buffer[offset + 3] = Math.round(Math.abs(n) * strength);
  }

  return buffer;
}
