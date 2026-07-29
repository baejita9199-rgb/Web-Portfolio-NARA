/**
 * Central asset manifest.
 *
 * Replacing the placeholder art direction is a one-file operation: point these
 * paths at new files of the same aspect ratio and the layout is unchanged.
 * See `docs/ASSETS.md` for the required crop, resolution and codec of each entry.
 */

const VIDEO = "/nara-house/video";
const IMAGE = "/nara-house/images";

export const naraAssets = {
  hero: {
    desktopVideo: `${VIDEO}/hero-desktop.webm`,
    desktopFallback: `${VIDEO}/hero-desktop.mp4`,
    mobileVideo: `${VIDEO}/hero-mobile.webm`,
    mobileFallback: `${VIDEO}/hero-mobile.mp4`,
    desktopPoster: `${IMAGE}/hero-poster-desktop.webp`,
    mobilePoster: `${IMAGE}/hero-poster-mobile.webp`,
  },
  video: {
    morningCurtain: `${VIDEO}/morning-curtain.webm`,
    morningCurtainFallback: `${VIDEO}/morning-curtain.mp4`,
    seasonalTable: `${VIDEO}/seasonal-table.webm`,
    seasonalTableFallback: `${VIDEO}/seasonal-table.mp4`,
    eveningLight: `${VIDEO}/evening-light.webm`,
    eveningLightFallback: `${VIDEO}/evening-light.mp4`,
  },
  images: {
    heroPosterDesktop: `${IMAGE}/hero-poster-desktop.webp`,
    heroPosterMobile: `${IMAGE}/hero-poster-mobile.webp`,
    architectureWide: `${IMAGE}/architecture-wide.webp`,
    architecturePortrait: `${IMAGE}/architecture-portrait.webp`,
    materialTimber: `${IMAGE}/material-timber.webp`,
    materialClay: `${IMAGE}/material-clay.webp`,
    materialStone: `${IMAGE}/material-stone.webp`,
    forestRoom01: `${IMAGE}/forest-room-01.webp`,
    forestRoom02: `${IMAGE}/forest-room-02.webp`,
    courtyardSuite01: `${IMAGE}/courtyard-suite-01.webp`,
    courtyardSuite02: `${IMAGE}/courtyard-suite-02.webp`,
    hillResidence01: `${IMAGE}/hill-residence-01.webp`,
    hillResidence02: `${IMAGE}/hill-residence-02.webp`,
    breakfast: `${IMAGE}/breakfast.webp`,
    forestPath: `${IMAGE}/forest-path.webp`,
    eveningRoom: `${IMAGE}/evening-room.webp`,
    seasonalTable: `${IMAGE}/seasonal-table.webp`,
    seasonalIngredients: `${IMAGE}/seasonal-ingredients.webp`,
    surroundings: `${IMAGE}/surroundings.webp`,
    teaTasting: `${IMAGE}/tea-tasting.webp`,
    bicycleRoute: `${IMAGE}/bicycle-route.webp`,
    gardenSession: `${IMAGE}/garden-session.webp`,
    readingPicnic: `${IMAGE}/reading-picnic.webp`,
    craftVisit: `${IMAGE}/craft-visit.webp`,
    journal01: `${IMAGE}/journal-01.webp`,
    journal02: `${IMAGE}/journal-02.webp`,
    journal03: `${IMAGE}/journal-03.webp`,
    ogNaraHouse: `${IMAGE}/og-nara-house.webp`,
  },
  posters: {
    morningCurtain: `${IMAGE}/poster-morning-curtain.webp`,
    seasonalTable: `${IMAGE}/poster-seasonal-table.webp`,
    eveningLight: `${IMAGE}/poster-evening-light.webp`,
  },
} as const;

/**
 * Aspect ratios are declared once so every `next/image` call ships intrinsic
 * dimensions and the page never shifts while media decodes.
 */
export const assetDimensions = {
  landscape: { width: 1920, height: 1080 },
  editorial: { width: 1280, height: 1600 },
  portrait: { width: 1200, height: 1600 },
  square: { width: 1200, height: 1200 },
  panoramic: { width: 2400, height: 1000 },
  detail: { width: 1400, height: 1050 },
  heroMobile: { width: 1080, height: 1440 },
  og: { width: 1200, height: 630 },
} as const;

export type AssetRatio = keyof typeof assetDimensions;
