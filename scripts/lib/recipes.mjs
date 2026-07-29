import { PALETTE as P } from "./compositor.mjs";

/**
 * Art direction for every generated placeholder.
 *
 * Each recipe is a small description of a light condition rather than a picture:
 * where the sun is, what is in shadow, whether there is mist in the valley. The
 * families below are shared so that, for example, every interior in the project
 * has the same window behaviour and the set reads as one shoot.
 */

const mist = (y, strength, phase = 0, extra = {}) => ({
  type: "band",
  y,
  height: 0.3,
  color: P.softWhite,
  strength,
  texture: true,
  scale: 2.6,
  phase,
  driftX: 0.35,
  driftY: 0.02,
  tilt: -0.05,
  ...extra,
});

const ridge = (height, strength, phase, colour = P.deepMoss) => ({
  type: "mass",
  edge: "bottom",
  height,
  strength,
  feather: 0.06,
  color: colour,
  wave: 0.045,
  waveCount: 2.4,
  phase,
});

const windowLight = (x, strength, extra = {}) => ({
  type: "shaft",
  x,
  width: 0.26,
  angle: 74,
  color: P.softWhite,
  strength,
  falloff: 0.45,
  ...extra,
});

const sun = (cx, cy, strength, r = 0.7) => ({
  type: "radial",
  cx,
  cy,
  r,
  color: P.softWhite,
  strength,
});

const warmSun = (cx, cy, strength, r = 0.6) => ({
  type: "radial",
  cx,
  cy,
  r,
  color: [244, 226, 198],
  strength,
});

const tonal = (strength = 0.08, scale = 3.5, colour = P.duskClay) => ({
  type: "grain",
  color: colour,
  strength,
  scale,
});

const vignette = (strength = 0.26, inner = 0.5) => ({
  type: "vignette",
  strength,
  inner,
});

/* --------------------------------------------------------------------------
   Light conditions
   -------------------------------------------------------------------------- */

/** Cool valley at first light — the arrival mood. */
const morningValley = (extra = []) => ({
  base: P.warmSand,
  layers: [
    {
      type: "linear",
      angle: 90,
      stops: [
        { at: 0, color: [206, 208, 200] },
        { at: 0.42, color: [188, 190, 178] },
        { at: 0.72, color: [126, 134, 118] },
        { at: 1, color: P.deepMoss },
      ],
    },
    sun(0.68, 0.24, 0.42, 0.78),
    ridge(0.46, 0.92, 0.4),
    ridge(0.3, 0.95, 2.1, [46, 58, 49]),
    ridge(0.16, 1, 4.2, P.charcoal),
    mist(0.56, 0.36, 0),
    mist(0.68, 0.28, 2.4),
    tonal(0.06),
    vignette(0.24, 0.55),
    ...extra,
  ],
});

/**
 * Warm interior with a single opening.
 *
 * The window is drawn as an actual rectangle rather than only a light shaft, so
 * the frame has a horizon and an architectural edge to read against — the
 * difference between a room and a smudge.
 */
const interior = (x, strength, warmth = 0.5, extra = []) => ({
  base: P.duskClay,
  layers: [
    {
      type: "linear",
      angle: 74,
      stops: [
        { at: 0, color: [58, 52, 46] },
        { at: 0.45, color: [104, 92, 79] },
        { at: 0.8, color: [158, 143, 124] },
        { at: 1, color: [196, 182, 162] },
      ],
    },
    // The opening itself, then the reveal that catches its edge.
    {
      type: "rect",
      x0: x - 0.19,
      x1: x + 0.19,
      y0: 0.1,
      y1: 0.62,
      color: [238, 232, 216],
      strength: 0.72,
      feather: 0.035,
    },
    {
      type: "rect",
      x0: x - 0.215,
      x1: x + 0.215,
      y0: 0.08,
      y1: 0.65,
      color: [72, 62, 53],
      strength: 0.3,
      feather: 0.012,
    },
    windowLight(x, strength),
    warmSun(x, 0.3, warmth * 0.5, 0.55),
    // Floor line: the horizontal that gives the room its depth.
    {
      type: "rect",
      x0: -0.1,
      x1: 1.1,
      y0: 0.74,
      y1: 1.1,
      color: [86, 74, 62],
      strength: 0.55,
      feather: 0.03,
    },
    {
      type: "mass",
      edge: "bottom",
      height: 0.24,
      strength: 0.7,
      feather: 0.18,
      color: [48, 42, 37],
    },
    tonal(0.07, 3),
    vignette(0.34, 0.42),
    ...extra,
  ],
});

/**
 * An enclosed courtyard: pale stone, open to the sky, lit from directly above.
 * Deliberately the coolest and brightest register in the set so the courtyard
 * suite never reads as a repeat of the forest room.
 */
const courtyard = (extra = []) => ({
  base: [198, 190, 176],
  layers: [
    {
      type: "linear",
      angle: 90,
      stops: [
        { at: 0, color: [226, 224, 214] },
        { at: 0.34, color: [204, 198, 186] },
        { at: 0.72, color: [166, 158, 145] },
        { at: 1, color: [118, 110, 100] },
      ],
    },
    // The open square of sky at the top of the frame.
    {
      type: "rect",
      x0: 0.16,
      x1: 0.84,
      y0: -0.1,
      y1: 0.3,
      color: [236, 236, 230],
      strength: 0.72,
      feather: 0.03,
    },
    sun(0.5, 0.06, 0.4, 0.66),
    // A hard diagonal of shadow thrown across the stone floor.
    {
      type: "shaft",
      x: 0.28,
      width: 0.4,
      angle: 52,
      color: [92, 86, 78],
      strength: 0.42,
      falloff: -0.3,
    },
    {
      type: "rect",
      x0: -0.1,
      x1: 1.1,
      y0: 0.68,
      y1: 1.1,
      color: [150, 142, 130],
      strength: 0.5,
      feather: 0.04,
    },
    { type: "grain", color: P.charcoal, strength: 0.1, scale: 14, octaves: 4 },
    vignette(0.3, 0.46),
    ...extra,
  ],
});

/**
 * Vertical timber slats. Generated rather than written out so the spacing stays
 * even and the density can be tuned in one place.
 */
const slats = (count, strength, colour = [64, 54, 46], y0 = -0.05, y1 = 1.05) =>
  Array.from({ length: count }, (_, index) => {
    const pitch = 1 / count;
    const centre = (index + 0.5) * pitch;
    const half = pitch * 0.22;
    return {
      type: "rect",
      x0: centre - half,
      x1: centre + half,
      y0,
      y1,
      color: colour,
      strength: strength * (0.72 + ((index * 37) % 11) / 22),
      feather: pitch * 0.16,
    };
  });

/** Flat overcast light on a material surface — the detail crops. */
const surface = (colour, accent, angle = 30, extra = []) => ({
  base: colour,
  layers: [
    {
      type: "linear",
      angle,
      stops: [
        { at: 0, color: accent },
        { at: 0.5, color: colour },
        { at: 1, color: accent },
      ],
    },
    { type: "grain", color: P.charcoal, strength: 0.16, scale: 11, octaves: 4 },
    { type: "grain", color: P.softWhite, strength: 0.1, scale: 26, octaves: 3 },
    sun(0.32, 0.22, 0.2, 0.7),
    vignette(0.3, 0.45),
    ...extra,
  ],
});

/** Green shade beneath a canopy. */
const forest = (extra = []) => ({
  base: P.forestGreen,
  layers: [
    {
      type: "linear",
      angle: 96,
      stops: [
        { at: 0, color: [96, 112, 92] },
        { at: 0.4, color: [64, 82, 66] },
        { at: 1, color: [34, 45, 37] },
      ],
    },
    windowLight(0.62, 0.3, { width: 0.14, angle: 68 }),
    windowLight(0.34, 0.18, { width: 0.1, angle: 82 }),
    { type: "grain", color: P.charcoal, strength: 0.2, scale: 7, octaves: 4 },
    sun(0.6, 0.14, 0.26, 0.6),
    vignette(0.36, 0.4),
    ...extra,
  ],
});

/** Last light — the evening register. */
const dusk = (extra = []) => ({
  base: P.charcoal,
  layers: [
    {
      type: "linear",
      angle: 90,
      stops: [
        { at: 0, color: [92, 84, 76] },
        { at: 0.35, color: [72, 66, 60] },
        { at: 0.7, color: [46, 44, 40] },
        { at: 1, color: [28, 28, 26] },
      ],
    },
    // A lit opening at the far end of the room, and the lamp beside it.
    {
      type: "rect",
      x0: 0.58,
      x1: 0.86,
      y0: 0.28,
      y1: 0.68,
      color: [214, 176, 122],
      strength: 0.5,
      feather: 0.04,
    },
    warmSun(0.72, 0.62, 0.5, 0.5),
    {
      type: "rect",
      x0: -0.1,
      x1: 1.1,
      y0: 0.72,
      y1: 1.1,
      color: [34, 32, 29],
      strength: 0.6,
      feather: 0.035,
    },
    {
      type: "mass",
      edge: "bottom",
      height: 0.3,
      strength: 0.85,
      feather: 0.14,
      color: [22, 22, 20],
    },
    tonal(0.06, 4),
    vignette(0.4, 0.36),
    ...extra,
  ],
});

/** Paper-toned still life for the table plates. */
const table = (extra = []) => ({
  base: P.warmSand,
  layers: [
    {
      type: "linear",
      angle: 62,
      stops: [
        { at: 0, color: [226, 216, 200] },
        { at: 0.52, color: [196, 182, 163] },
        { at: 1, color: [140, 122, 102] },
      ],
    },
    warmSun(0.28, 0.2, 0.4, 0.6),
    {
      type: "radial",
      cx: 0.54,
      cy: 0.58,
      rx: 0.34,
      ry: 0.26,
      color: [122, 104, 86],
      strength: 0.5,
    },
    { type: "grain", color: P.clayBrown, strength: 0.12, scale: 9, octaves: 4 },
    vignette(0.3, 0.44),
    ...extra,
  ],
});

/* --------------------------------------------------------------------------
   Still images
   -------------------------------------------------------------------------- */

export const imageRecipes = {
  "hero-poster-desktop": { size: [1920, 1080], recipe: morningValley() },
  "hero-poster-mobile": { size: [1080, 1440], recipe: morningValley() },

  "architecture-wide": {
    size: [2400, 1000],
    recipe: {
      base: P.warmSand,
      layers: [
        {
          type: "linear",
          angle: 92,
          stops: [
            { at: 0, color: [212, 212, 202] },
            { at: 0.46, color: [178, 178, 166] },
            { at: 1, color: [92, 100, 88] },
          ],
        },
        sun(0.24, 0.2, 0.36, 0.8),
        ridge(0.5, 0.85, 1.2, [70, 84, 70]),
        // The long horizontal of the building itself, sitting low in the frame.
        {
          type: "band",
          y: 0.66,
          height: 0.2,
          color: [78, 68, 58],
          strength: 0.85,
          tilt: 0.012,
        },
        {
          type: "band",
          y: 0.6,
          height: 0.04,
          color: [232, 220, 200],
          strength: 0.5,
          tilt: 0.012,
        },
        ridge(0.2, 1, 3.4, [40, 50, 42]),
        mist(0.5, 0.22, 1.1),
        tonal(0.05),
        vignette(0.24, 0.55),
      ],
    },
  },

  /** Exterior: the house read from the garden, through its timber screens. */
  "architecture-portrait": {
    size: [1200, 1600],
    recipe: {
      base: P.warmSand,
      layers: [
        {
          type: "linear",
          angle: 92,
          stops: [
            { at: 0, color: [206, 206, 194] },
            { at: 0.3, color: [178, 174, 158] },
            { at: 0.66, color: [124, 118, 102] },
            { at: 1, color: [62, 72, 60] },
          ],
        },
        sun(0.7, 0.14, 0.34, 0.7),
        // The body of the house, then the screens across its face.
        {
          type: "rect",
          x0: 0.08,
          x1: 0.98,
          y0: 0.3,
          y1: 0.82,
          color: [104, 92, 78],
          strength: 0.72,
          feather: 0.02,
        },
        ...slats(14, 0.4, [56, 48, 40], 0.32, 0.8),
        {
          type: "rect",
          x0: 0.08,
          x1: 0.98,
          y0: 0.28,
          y1: 0.34,
          color: [46, 40, 34],
          strength: 0.6,
          feather: 0.012,
        },
        // Planting in the foreground, holding the bottom of the frame.
        {
          type: "mass",
          edge: "bottom",
          height: 0.2,
          strength: 0.86,
          feather: 0.09,
          color: [46, 58, 46],
          wave: 0.05,
          waveCount: 3.2,
        },
        tonal(0.06),
        vignette(0.3, 0.46),
      ],
    },
  },

  "material-timber": {
    size: [1920, 1080],
    recipe: {
      base: P.duskClay,
      layers: [
        {
          type: "linear",
          angle: 88,
          stops: [
            { at: 0, color: [196, 190, 176] },
            { at: 0.4, color: [150, 136, 118] },
            { at: 1, color: [72, 62, 53] },
          ],
        },
        // Vertical timber screens running the length of the terrace.
        ...slats(26, 0.42, [58, 48, 40], 0.06, 0.82),
        { type: "grain", color: P.charcoal, strength: 0.1, scale: 30, octaves: 3 },
        windowLight(0.2, 0.34, { width: 0.34, angle: 84 }),
        {
          type: "mass",
          edge: "bottom",
          height: 0.22,
          strength: 0.8,
          feather: 0.1,
          color: [52, 46, 40],
        },
        vignette(0.3, 0.46),
      ],
    },
  },

  "material-clay": {
    size: [1200, 1200],
    recipe: surface([182, 166, 146], [214, 202, 184], 24),
  },

  /** A deep opening cut through a stone wall, light landing on the sill. */
  "material-stone": {
    size: [1200, 1600],
    recipe: {
      base: [126, 120, 110],
      layers: [
        {
          type: "linear",
          angle: 70,
          stops: [
            { at: 0, color: [88, 84, 78] },
            { at: 0.5, color: [128, 122, 112] },
            { at: 1, color: [96, 90, 82] },
          ],
        },
        { type: "grain", color: P.charcoal, strength: 0.14, scale: 13, octaves: 4 },
        // The reveal, then the bright opening set inside it.
        {
          type: "rect",
          x0: 0.24,
          x1: 0.76,
          y0: 0.22,
          y1: 0.72,
          color: [72, 68, 62],
          strength: 0.6,
          feather: 0.02,
        },
        {
          type: "rect",
          x0: 0.32,
          x1: 0.68,
          y0: 0.26,
          y1: 0.64,
          color: [232, 228, 214],
          strength: 0.82,
          feather: 0.025,
        },
        // Light spilling down onto the sill below the opening.
        {
          type: "rect",
          x0: 0.28,
          x1: 0.72,
          y0: 0.64,
          y1: 0.72,
          color: [212, 200, 180],
          strength: 0.5,
          feather: 0.03,
        },
        vignette(0.36, 0.4),
      ],
    },
  },

  "forest-room-01": { size: [1280, 1600], recipe: interior(0.72, 0.46, 0.55) },
  "forest-room-02": { size: [1400, 1050], recipe: interior(0.3, 0.4, 0.6) },
  "courtyard-suite-01": { size: [1280, 1600], recipe: courtyard() },
  "courtyard-suite-02": {
    size: [1400, 1050],
    recipe: surface([196, 186, 170], [166, 154, 138], 52),
  },
  "hill-residence-01": { size: [1280, 1600], recipe: dusk() },
  "hill-residence-02": { size: [1400, 1050], recipe: dusk() },

  breakfast: { size: [1400, 1050], recipe: table() },
  "seasonal-table": { size: [1400, 1050], recipe: table() },
  "seasonal-ingredients": {
    size: [1200, 1200],
    recipe: table([
      {
        type: "radial",
        cx: 0.38,
        cy: 0.44,
        rx: 0.22,
        ry: 0.2,
        color: [96, 112, 84],
        strength: 0.5,
      },
    ]),
  },
  "tea-tasting": { size: [1400, 1050], recipe: table() },
  "craft-visit": {
    size: [1400, 1050],
    recipe: surface([172, 152, 130], [204, 190, 170], 68),
  },

  "forest-path": { size: [1200, 1600], recipe: forest() },
  "garden-session": { size: [1400, 1050], recipe: forest() },
  "reading-picnic": { size: [1400, 1050], recipe: forest() },
  "bicycle-route": {
    size: [1400, 1050],
    recipe: {
      base: P.warmSand,
      layers: [
        {
          type: "linear",
          angle: 94,
          stops: [
            { at: 0, color: [216, 212, 198] },
            { at: 0.5, color: [176, 176, 152] },
            { at: 1, color: [104, 104, 82] },
          ],
        },
        sun(0.5, 0.16, 0.4, 0.8),
        ridge(0.34, 0.8, 2.2, [92, 100, 76]),
        {
          type: "shaft",
          x: 0.5,
          width: 0.3,
          angle: 90,
          color: [148, 140, 120],
          strength: 0.5,
          falloff: -0.6,
        },
        tonal(0.06),
        vignette(0.26, 0.5),
      ],
    },
  },

  "evening-room": { size: [1920, 1080], recipe: dusk() },

  surroundings: {
    size: [1920, 1080],
    recipe: morningValley([
      { type: "vignette", strength: 0.34, inner: 0.4, color: P.charcoal },
    ]),
  },

  "journal-01": {
    size: [1400, 1050],
    recipe: surface([190, 176, 156], [220, 210, 194], 18),
  },
  "journal-02": { size: [1920, 1080], recipe: morningValley() },
  "journal-03": { size: [1280, 1600], recipe: table() },

  "poster-morning-curtain": { size: [1400, 1050], recipe: interior(0.58, 0.55, 0.7) },
  "poster-seasonal-table": { size: [1080, 1350], recipe: table() },
  "poster-evening-light": { size: [1920, 1080], recipe: dusk() },

  "og-nara-house": { size: [1200, 630], recipe: morningValley() },
};

/* --------------------------------------------------------------------------
   Ambient clips
   -------------------------------------------------------------------------- */

/**
 * Clip motion is intentionally almost nothing: mist crossing a valley, a
 * curtain breathing, steam rising. Every animated term is a full sine cycle
 * over the loop so the last frame hands back to the first without a cut.
 */
export const videoRecipes = {
  "hero-desktop": {
    size: [1600, 900],
    seconds: 6,
    fps: 24,
    bitrate: "900k",
    recipe: {
      ...morningValley(),
      layers: morningValley().layers.map((layer) =>
        layer.type === "band"
          ? { ...layer, driftX: 0.5, driftY: 0.035 }
          : layer.type === "radial"
            ? { ...layer, drift: 0.012 }
            : layer,
      ),
    },
  },

  "hero-mobile": {
    size: [1080, 1440],
    seconds: 6,
    fps: 24,
    bitrate: "800k",
    recipe: {
      ...morningValley(),
      layers: morningValley().layers.map((layer) =>
        layer.type === "band"
          ? { ...layer, driftX: 0.5, driftY: 0.035 }
          : layer.type === "radial"
            ? { ...layer, drift: 0.012 }
            : layer,
      ),
    },
  },

  "morning-curtain": {
    size: [1280, 960],
    seconds: 5,
    fps: 24,
    bitrate: "600k",
    recipe: {
      ...interior(0.58, 0.55, 0.7),
      layers: [
        ...interior(0.58, 0.55, 0.7).layers,
        // The curtain itself: a soft vertical body that sways across the light.
        {
          type: "shaft",
          x: 0.58,
          width: 0.42,
          angle: 88,
          color: [236, 226, 208],
          strength: 0.3,
          drift: 0.035,
          falloff: 0.2,
        },
        {
          type: "band",
          y: 0.5,
          height: 0.9,
          color: [232, 222, 204],
          strength: 0.16,
          texture: true,
          scale: 2,
          driftX: 0.5,
          driftY: 0.012,
        },
      ],
    },
  },

  "seasonal-table": {
    size: [1080, 1350],
    seconds: 5,
    fps: 24,
    bitrate: "600k",
    recipe: {
      ...table(),
      layers: [
        ...table().layers,
        // Steam: two slow columns rising and fading at different rates.
        {
          type: "band",
          y: 0.34,
          height: 0.34,
          color: P.softWhite,
          strength: 0.2,
          texture: true,
          scale: 3.4,
          driftX: 0.6,
          driftY: 0.05,
          phase: 0,
        },
        {
          type: "band",
          y: 0.22,
          height: 0.26,
          color: P.softWhite,
          strength: 0.14,
          texture: true,
          scale: 4.2,
          driftX: 0.5,
          driftY: 0.06,
          phase: 2.1,
        },
      ],
    },
  },

  "evening-light": {
    size: [1600, 900],
    seconds: 6,
    fps: 24,
    bitrate: "700k",
    recipe: {
      ...dusk(),
      layers: [
        ...dusk().layers,
        // Lamplight breathing very slightly, as a flame would.
        {
          type: "radial",
          cx: 0.72,
          cy: 0.6,
          rx: 0.32,
          ry: 0.3,
          color: [248, 226, 190],
          strength: 0.22,
          drift: 0.014,
        },
      ],
    },
  },
};
