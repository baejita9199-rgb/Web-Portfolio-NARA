import { assetDimensions, naraAssets } from "./assets";
import type { Room } from "./types";

const { images } = naraAssets;

export const rooms: readonly Room[] = [
  {
    slug: "forest-room",
    name: "Forest Room",
    description:
      "A private room framed by the garden and morning light.",
    area: "42 SQ M",
    guests: 2,
    bed: "King Bed",
    features: ["Private Garden", "Timber Floors", "Deep Reading Window"],
    conceptRateThb: 8900,
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
    ],
  },
  {
    slug: "courtyard-suite",
    name: "Courtyard Suite",
    description:
      "A quiet suite opening toward an enclosed stone courtyard.",
    area: "58 SQ M",
    guests: 2,
    bed: "King Bed",
    features: ["Stone Courtyard", "Separate Sitting Room", "Outdoor Bath"],
    conceptRateThb: 12400,
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
