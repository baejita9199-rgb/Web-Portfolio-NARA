import { assetDimensions, naraAssets } from "./assets";
import type { Experience, Material } from "./types";

const { images } = naraAssets;

export const experiences: readonly Experience[] = [
  {
    title: "Guided forest walk",
    description:
      "An early route through the ridge behind the house, led by someone who has walked it for thirty years.",
    season: "Year round",
    image: {
      src: images.forestPath,
      ...assetDimensions.detail,
      alt: "A narrow footpath disappearing into tall forest.",
    },
  },
  {
    title: "Local craft visit",
    description:
      "An afternoon with a weaver or a potter working a few valleys away, in their own workshop.",
    season: "Nov — Mar",
    image: {
      src: images.craftVisit,
      ...assetDimensions.detail,
      alt: "Hands turning a clay form on a low workshop table.",
    },
  },
  {
    title: "Tea tasting",
    description:
      "Six leaves from the surrounding hills, poured slowly at the long table through the middle of the day.",
    season: "Year round",
    image: {
      src: images.teaTasting,
      ...assetDimensions.detail,
      alt: "Tea being poured into a small unglazed cup.",
    },
  },
  {
    title: "Bicycle route",
    description:
      "A quiet nineteen kilometres between villages, mostly downhill, with somewhere to stop for noodles.",
    season: "Oct — Feb",
    image: {
      src: images.bicycleRoute,
      ...assetDimensions.detail,
      alt: "An empty rural road curving between fields at first light.",
    },
  },
  {
    title: "Seasonal garden session",
    description:
      "Whatever the garden needs that week — planting, cutting, or simply learning what is edible.",
    season: "Year round",
    image: {
      src: images.gardenSession,
      ...assetDimensions.detail,
      alt: "A hand gathering herbs from a raised garden bed.",
    },
  },
  {
    title: "Private reading picnic",
    description:
      "A blanket, a flask and a book, carried to a clearing above the house and left to you until dusk.",
    season: "Nov — Feb",
    image: {
      src: images.readingPicnic,
      ...assetDimensions.detail,
      alt: "A blanket and an open book on grass in dappled shade.",
    },
  },
];

export const materials: readonly Material[] = [
  {
    index: "01",
    label: "Local timber",
    note: "Cut from managed stands within the valley and left largely untreated. Oiled only where hands meet it, so those edges darken first.",
  },
  {
    index: "02",
    label: "Hand-finished plaster",
    note: "Lime and river sand, floated by hand so the wall keeps its own texture. It breathes, which is why the rooms dry out between storms.",
  },
  {
    index: "03",
    label: "Natural stone",
    note: "Collected from the surrounding terrain during the build and laid dry, without mortar. It stays the coolest surface on the property.",
  },
  {
    index: "04",
    label: "Woven textile",
    note: "Undyed cotton and hemp from weavers working two valleys away. Left uncoloured so it filters the light without tinting it.",
  },
];
