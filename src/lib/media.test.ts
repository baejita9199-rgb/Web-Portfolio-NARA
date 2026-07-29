import { describe, expect, it } from "vitest";
import {
  resolvePoster,
  resolvePreload,
  resolveVideoSources,
} from "./media";

const base = {
  desktopSrc: "/nara-house/video/hero-desktop.webm",
  mobileSrc: "/nara-house/video/hero-mobile.webm",
  desktopFallbackSrc: "/nara-house/video/hero-desktop.mp4",
  mobileFallbackSrc: "/nara-house/video/hero-mobile.mp4",
};

describe("asset source selection", () => {
  it("serves the landscape crop on desktop", () => {
    const sources = resolveVideoSources({ ...base, isMobile: false });
    expect(sources[0]).toEqual({
      src: base.desktopSrc,
      type: "video/webm",
    });
  });

  it("serves the portrait crop on mobile", () => {
    const sources = resolveVideoSources({ ...base, isMobile: true });
    expect(sources[0]?.src).toBe(base.mobileSrc);
  });

  it("falls back to the landscape crop when no portrait file exists", () => {
    const sources = resolveVideoSources({
      desktopSrc: base.desktopSrc,
      isMobile: true,
    });
    expect(sources[0]?.src).toBe(base.desktopSrc);
  });

  it("omits MP4 sources while no H.264 files are shipped", () => {
    const sources = resolveVideoSources({ ...base, includeMp4: false });
    expect(sources).toHaveLength(1);
    expect(sources.some((source) => source.type === "video/mp4")).toBe(false);
  });

  it("lists WebM before MP4 once fallbacks are enabled", () => {
    const sources = resolveVideoSources({ ...base, includeMp4: true });
    expect(sources.map((source) => source.type)).toEqual([
      "video/webm",
      "video/mp4",
    ]);
  });

  it("pairs the mobile MP4 with the mobile WebM", () => {
    const sources = resolveVideoSources({
      ...base,
      isMobile: true,
      includeMp4: true,
    });
    expect(sources.map((source) => source.src)).toEqual([
      base.mobileSrc,
      base.mobileFallbackSrc,
    ]);
  });

  it("skips the MP4 entry when only the WebM has a portrait crop", () => {
    const sources = resolveVideoSources({
      desktopSrc: base.desktopSrc,
      mobileSrc: base.mobileSrc,
      isMobile: true,
      includeMp4: true,
    });
    // No mobile MP4 and no desktop MP4 were supplied, so nothing is invented.
    expect(sources).toHaveLength(1);
  });
});

describe("poster selection", () => {
  const poster = "/nara-house/images/hero-poster-desktop.webp";
  const mobilePoster = "/nara-house/images/hero-poster-mobile.webp";

  it("uses the portrait poster on mobile when one exists", () => {
    expect(resolvePoster(poster, mobilePoster, true)).toBe(mobilePoster);
  });

  it("uses the landscape poster on desktop", () => {
    expect(resolvePoster(poster, mobilePoster, false)).toBe(poster);
  });

  it("falls back to the landscape poster when no portrait crop exists", () => {
    expect(resolvePoster(poster, undefined, true)).toBe(poster);
  });
});

describe("preload policy", () => {
  it("gives the hero metadata immediately", () => {
    expect(resolvePreload(true, false)).toBe("metadata");
  });

  it("downloads nothing for a clip that is still far off-screen", () => {
    expect(resolvePreload(false, false)).toBe("none");
  });

  it("promotes a clip to metadata once it approaches the viewport", () => {
    expect(resolvePreload(false, true)).toBe("metadata");
  });
});
