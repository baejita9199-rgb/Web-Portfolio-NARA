/**
 * Media source selection.
 *
 * Kept as pure functions rather than component logic so the ordering rules —
 * which crop for which viewport, which codec first — are unit-testable without
 * mounting a video element.
 */

/**
 * The bundled placeholder clips ship as VP8/WebM only. Once H.264 `.mp4`
 * siblings are added to `/public/nara-house/video`, flip this to `true` and the
 * `<source>` list gains an MP4 fallback for browsers without WebM support
 * (notably iOS Safari before 17.4). See `docs/ASSETS.md`.
 */
export const MP4_FALLBACKS_AVAILABLE = false;

export type VideoSource = {
  src: string;
  type: string;
};

export type VideoSourceInput = {
  desktopSrc: string;
  mobileSrc?: string;
  desktopFallbackSrc?: string;
  mobileFallbackSrc?: string;
  isMobile?: boolean;
  /** Overridable so tests do not depend on the module-level constant. */
  includeMp4?: boolean;
};

/**
 * Ordered `<source>` list. The browser takes the first entry it can decode, so
 * WebM leads (smaller for the same quality) and MP4 trails as the compatibility
 * net. A portrait crop is only offered when one actually exists.
 */
export function resolveVideoSources({
  desktopSrc,
  mobileSrc,
  desktopFallbackSrc,
  mobileFallbackSrc,
  isMobile = false,
  includeMp4 = MP4_FALLBACKS_AVAILABLE,
}: VideoSourceInput): VideoSource[] {
  const primary = isMobile && mobileSrc ? mobileSrc : desktopSrc;
  const sources: VideoSource[] = [{ src: primary, type: "video/webm" }];

  if (includeMp4) {
    const fallback =
      isMobile && mobileFallbackSrc ? mobileFallbackSrc : desktopFallbackSrc;
    if (fallback) {
      sources.push({ src: fallback, type: "video/mp4" });
    }
  }

  return sources;
}

/** Portrait poster on narrow viewports when one is supplied, else the wide crop. */
export function resolvePoster(
  poster: string,
  mobilePoster: string | undefined,
  isMobile: boolean,
): string {
  return isMobile && mobilePoster ? mobilePoster : poster;
}

/**
 * `preload` is a bandwidth decision, not a cosmetic one. Only the hero is worth
 * metadata on first paint; everything below the fold stays at `none` until the
 * intersection observer says the clip is about to be seen.
 */
export function resolvePreload(
  priority: boolean,
  shouldLoad: boolean,
): "none" | "metadata" {
  if (priority) return "metadata";
  return shouldLoad ? "metadata" : "none";
}

/**
 * `sizes` for the responsive image set. Declaring the real rendered width stops
 * the browser downloading a 1920px file for a 480px column.
 */
export const imageSizes = {
  full: "100vw",
  half: "(max-width: 47.99rem) 100vw, 50vw",
  third: "(max-width: 47.99rem) 100vw, (max-width: 63.99rem) 50vw, 33vw",
  column: "(max-width: 47.99rem) 100vw, (max-width: 63.99rem) 60vw, 42vw",
  narrow: "(max-width: 47.99rem) 84vw, 28vw",
  gallery: "(max-width: 47.99rem) 86vw, (max-width: 63.99rem) 60vw, 38vw",
} as const;
