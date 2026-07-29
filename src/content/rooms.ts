import { assetDimensions, naraAssets } from "./assets";
import type { Room } from "./types";

const { images } = naraAssets;

export const rooms: readonly Room[] = [
  {
    slug: "forest-room",
    name: "Forest Room",
    description: "A private room framed by the garden and morning light.",
    area: "42 SQ M",
    guests: 2,
    bed: "King Bed",
    features: ["Private Garden", "Timber Floors", "Deep Reading Window"],
    conceptRateThb: 8900,
    orientation:
      "Faces east into the garden. Full light from around six until nine, then shade for the rest of the day.",
    bestFor:
      "Early risers, and anyone who would rather read than have a view to look at.",
    seasonNote:
      "Coolest room in the house through the hot months, thanks to the depth of the eaves and the trees the garden was built around.",
    materials: ["Local timber", "Hand-finished plaster", "Woven textile"],
    story: [
      "The Forest Room was the first room drawn and the last one finished, because the two mango trees outside it kept changing what was possible. The wall facing the garden moved three times. What it settled into is a room that is almost entirely about one window.",
      "That window is nine hundred millimetres deep — deep enough to sit in, which is what most guests end up doing. The sill is a single piece of timber from the same stand as the floor, and it has already darkened where hands and cups have been.",
      "Everything else in the room is deliberately quiet. A bed, a low table, a lamp that can be moved, and a hook rather than a wardrobe. There is no desk, on the grounds that a window that deep is a better place to work than any desk would be.",
    ],
    details: [
      { label: "Outlook", value: "Enclosed garden, no other rooms in view" },
      { label: "Bathroom", value: "Interior, with a stone floor and a deep tub" },
      { label: "Climate", value: "Ceiling fan and cross-ventilation; no air conditioning" },
      { label: "Sound", value: "Birds from about half past five. There is no way around this." },
      { label: "Steps", value: "Level access from the courtyard, no stairs" },
    ],
    heroImage: {
      src: images.forestRoom01,
      ...assetDimensions.editorial,
      alt: "A quiet bedroom opening onto a shaded garden, morning light across the timber floor.",
    },
    gallery: [
      {
        src: images.forestRoom02,
        ...assetDimensions.detail,
        alt: "Close view of a linen-dressed bed beside a low timber window.",
      },
      {
        src: images.detailWindow,
        ...assetDimensions.portrait,
        alt: "The deep timber window seat, light falling across the sill.",
      },
      {
        src: images.forestRoom03,
        ...assetDimensions.detail,
        alt: "The garden immediately outside the room, dense and shaded.",
      },
    ],
  },

  {
    slug: "courtyard-suite",
    name: "Courtyard Suite",
    description: "A quiet suite opening toward an enclosed stone courtyard.",
    area: "58 SQ M",
    guests: 2,
    bed: "King Bed",
    features: ["Stone Courtyard", "Separate Sitting Room", "Outdoor Bath"],
    conceptRateThb: 12400,
    orientation:
      "Opens west onto the courtyard. Indirect light all morning, then the long shadow across the stone from about four.",
    bestFor:
      "Longer stays, and guests who want somewhere to sit that is neither the bedroom nor a public room.",
    seasonNote:
      "The courtyard is the coolest surface on the property in April and the wettest in September. Both are worth experiencing.",
    materials: ["Natural stone", "Local timber", "Hand-finished plaster"],
    story: [
      "The suite is really two rooms and a piece of outdoors. The sitting room came about because early guests kept carrying chairs from the bedroom to the courtyard door, which was a fairly direct piece of feedback.",
      "The outdoor bath is set into the courtyard wall under an open section of roof. In the wet season you can lie in it during a storm without getting rained on, which is the single most reported experience of staying here.",
      "The stone underfoot was collected during the excavation and laid dry — no mortar. It moves fractionally with the seasons and makes a particular sound underfoot that guests notice on the first evening and stop noticing by the second.",
    ],
    details: [
      { label: "Outlook", value: "Private enclosed courtyard, open to the sky" },
      { label: "Bathroom", value: "Interior shower plus an outdoor bath under open roof" },
      { label: "Climate", value: "Ceiling fans; the courtyard draws air through from mid-afternoon" },
      { label: "Sound", value: "Rain on stone, which is loud and is the point" },
      { label: "Steps", value: "Two shallow steps down into the courtyard" },
    ],
    heroImage: {
      src: images.courtyardSuite01,
      ...assetDimensions.editorial,
      alt: "A suite interior facing an enclosed courtyard of pale stone.",
    },
    gallery: [
      {
        src: images.courtyardSuite02,
        ...assetDimensions.detail,
        alt: "Afternoon shadow falling across the stone floor of a small courtyard.",
      },
      {
        src: images.courtyardSuite03,
        ...assetDimensions.portrait,
        alt: "The courtyard seen from the sitting room, open to the sky above.",
      },
      {
        src: images.detailWater,
        ...assetDimensions.detail,
        alt: "Still water in the courtyard drain after rain.",
      },
    ],
  },

  {
    slug: "hill-residence",
    name: "Hill Residence",
    description:
      "A larger residence with a private terrace and distant mountain view.",
    area: "86 SQ M",
    guests: 4,
    bed: "King Bed & Twin Room",
    features: ["Private Terrace", "Mountain View", "Kitchen Corner"],
    conceptRateThb: 18600,
    orientation:
      "Sits highest on the slope and faces north-west across the valley. Long light from four o'clock until it goes.",
    bestFor:
      "Two couples, a family with older children, or one person who wants considerably more room than they need.",
    seasonNote:
      "Between November and February the cloud sits below the terrace at dawn. It is the reason this room exists where it does.",
    materials: ["Local timber", "Natural stone", "Woven textile"],
    story: [
      "The Hill Residence is set forty metres up the slope from everything else and reached by a path rather than a corridor. That separation is deliberate: it is the only part of the property from which you cannot see the rest of it.",
      "The terrace is larger than the sitting room, which sounds like a planning error and is not. It faces the valley, it is roofed at one end, and it holds the last two hours of light long after the lower rooms have gone into shade.",
      "There is a kitchen corner — two rings, a sink, a small refrigerator — because guests staying a week or more inevitably want to make their own breakfast at least once. It is not a full kitchen and is not meant to be.",
    ],
    details: [
      { label: "Outlook", value: "Open valley and the far range; no neighbouring building visible" },
      { label: "Bathroom", value: "Two: one interior, one off the twin room" },
      { label: "Climate", value: "Noticeably cooler than the lower rooms; blankets are provided" },
      { label: "Sound", value: "Wind, mostly. Very little else reaches this far up." },
      { label: "Steps", value: "A forty-metre path with an eight-metre rise. Not step-free." },
    ],
    heroImage: {
      src: images.hillResidence01,
      ...assetDimensions.editorial,
      alt: "A residence terrace looking out over layered ridgelines at dusk.",
    },
    gallery: [
      {
        src: images.hillResidence02,
        ...assetDimensions.detail,
        alt: "A low table and two chairs on a covered terrace facing the hills.",
      },
      {
        src: images.hillResidence03,
        ...assetDimensions.landscape,
        alt: "The valley seen from the terrace with cloud sitting below the ridgeline.",
      },
      {
        src: images.detailLamp,
        ...assetDimensions.detail,
        alt: "A single lamp lit on the terrace as the last daylight goes.",
      },
    ],
  },
];

export function getRoomBySlug(slug: string): Room | undefined {
  return rooms.find((room) => room.slug === slug);
}

/** Room names in the order used by the gallery's progress indicator. */
export function getRoomSlugs(): string[] {
  return rooms.map((room) => room.slug);
}

/** "01 / 03" style counter used by the gallery and room detail headers. */
export function formatRoomProgress(index: number, total = rooms.length): string {
  const safeIndex = Math.min(Math.max(index, 0), Math.max(total - 1, 0));
  return `${String(safeIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
}

/** Every image a room contributes to the page, hero first. */
export function getRoomImages(room: Room) {
  return [room.heroImage, ...room.gallery];
}

/** The other rooms, in canonical order — used by the "elsewhere" footer. */
export function getOtherRooms(slug: string): Room[] {
  return rooms.filter((room) => room.slug !== slug);
}

/**
 * Fittings shared by every room, so each room page can describe only what makes
 * it different rather than repeating the same list three times.
 */
export const sharedRoomFittings = [
  "Undyed cotton and hemp bedding, woven two valleys away",
  "Filtered water, refilled daily, in glass",
  "Local tea and a kettle; no minibar",
  "Cotton robes and slippers",
  "A lamp that can be moved, and a switch within reach of the bed",
  "No television, and no clock unless you bring one",
] as const;
