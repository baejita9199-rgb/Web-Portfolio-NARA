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
  /** Long-form copy for the room's own page. */
  story: string[];
  /** Which way the room faces, and what that means at each hour. */
  orientation: string;
  /** The kind of stay the room suits — written as guidance, not as a sell. */
  bestFor: string;
  /** How the room changes across the year. */
  seasonNote: string;
  /** Materials particular to this room, referenced by label. */
  materials: string[];
  /** Plain, unglamorous facts a guest would actually want before booking. */
  details: { label: string; value: string }[];
};

/**
 * An article is a sequence of typed blocks rather than a flat string array.
 *
 * Long-form editorial needs subheads, pull quotes and captioned plates to hold a
 * reader; modelling them explicitly keeps that structure in the content layer
 * instead of smuggling markup into prose.
 */
export type ArticleBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "subhead"; text: string }
  | { kind: "quote"; text: string; attribution?: string }
  | { kind: "figure"; image: ImageAsset; caption: string }
  | { kind: "list"; title?: string; items: string[] };

export type JournalEntry = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  /** ISO-8601 date. */
  publishedAt: string;
  readingTime: string;
  image?: ImageAsset;
  /** Standfirst — the line set under the title before the article opens. */
  standfirst: string;
  body: ArticleBlock[];
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

/** A practical fact about staying, written plainly rather than sold. */
export type StayDetail = {
  label: string;
  value: string;
  note?: string;
};

/** One entry in the sample menu, which now spans the year rather than a day. */
export type MenuCourse = {
  time: string;
  season: string;
  dish: string;
  note?: string;
};
