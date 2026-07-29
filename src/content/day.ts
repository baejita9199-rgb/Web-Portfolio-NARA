import { assetDimensions, naraAssets } from "./assets";
import type { DayChapter } from "./types";

const { images, posters, video } = naraAssets;

export const dayChapters: readonly DayChapter[] = [
  {
    time: "Morning",
    title: "Light enters first",
    lines: [
      "Light enters through linen curtains.",
      "Breakfast is served beside the garden.",
    ],
    media: {
      kind: "video",
      video: {
        desktopSrc: video.morningCurtain,
        desktopFallbackSrc: video.morningCurtainFallback,
        poster: posters.morningCurtain,
        description:
          "Early sunlight moving slowly across a linen curtain as it shifts in the air.",
      },
      poster: {
        src: posters.morningCurtain,
        ...assetDimensions.detail,
        alt: "Morning light behind a linen curtain.",
      },
    },
  },
  {
    time: "Afternoon",
    title: "The hours widen",
    lines: [
      "Walk slowly through the forest.",
      "Read, write or remain still.",
    ],
    media: {
      kind: "image",
      image: {
        src: images.forestPath,
        ...assetDimensions.portrait,
        alt: "A forest path in flat afternoon light, leaves overhead.",
      },
    },
  },
  {
    time: "Evening",
    title: "The table is set",
    lines: [
      "Seasonal food, warm light and quiet conversations.",
      "Nothing is hurried toward its end.",
    ],
    media: {
      kind: "image",
      image: {
        src: images.breakfast,
        ...assetDimensions.detail,
        alt: "A shared table laid simply under warm evening light.",
      },
    },
  },
  {
    time: "Night",
    title: "The house settles",
    lines: [
      "The house settles into darkness beneath the trees.",
      "Only the lamps at the terrace stay on.",
    ],
    media: {
      kind: "image",
      image: {
        src: images.eveningRoom,
        ...assetDimensions.landscape,
        alt: "A room at night with one low lamp and the garden dark beyond the glass.",
      },
    },
  },
];
