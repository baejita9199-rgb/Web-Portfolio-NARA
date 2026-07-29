/**
 * Content model for NARA HOUSE.
 *
 * Every string rendered on the site originates from `src/content`, never from a
 * component. The shapes below are intentionally CMS-shaped (flat, serialisable,
 * slug-addressable) so the whole model can be swapped for a headless source
 * without touching a single component.
 */

export type ImageAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type VideoAsset = {
  /** Primary desktop-oriented source (landscape crop). */
  desktopSrc: string;
  /** Optional portrait crop served to narrow viewports. */
  mobileSrc?: string;
  /** Optional H.264 fallbacks for browsers without WebM support. */
  desktopFallbackSrc?: string;
  mobileFallbackSrc?: string;
  poster: string;
  mobilePoster?: string;
  /** Text alternative describing what the clip shows, for reduced-motion users. */
  description: string;
};

export type Room = {
  slug: string;
  name: string;
  description: string;
  area: string;
  guests: number;
  bed: string;
  features: string[];
  heroImage: ImageAsset;
  gallery: ImageAsset[];
  /** Concept-only nightly rate, always rendered with a "concept pricing" label. */
  conceptRateThb: number;
};

export type JournalEntry = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  /** ISO-8601 date. */
  publishedAt: string;
  readingTime: string;
  image?: ImageAsset;
  /** Paragraphs of the demo article body. */
  body: string[];
};

export type Experience = {
  title: string;
  description: string;
  image: ImageAsset;
  season: string;
};

export type Material = {
  index: string;
  label: string;
  note: string;
};

export type DayChapter = {
  time: string;
  title: string;
  lines: string[];
  media:
    | { kind: "image"; image: ImageAsset }
    | { kind: "video"; video: VideoAsset; poster: ImageAsset };
};

export type NavigationLink = {
  label: string;
  href: string;
  /** DOM id of the section this link scrolls to, when it is an in-page anchor. */
  sectionId?: string;
};
