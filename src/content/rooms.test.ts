import { describe, expect, it } from "vitest";
import {
  formatRoomProgress,
  getRoomBySlug,
  getRoomImages,
  getRoomSlugs,
  rooms,
} from "./rooms";
import { site } from "./site";

describe("room data mapping", () => {
  it("exposes the three concept rooms in a stable order", () => {
    expect(getRoomSlugs()).toEqual([
      "forest-room",
      "courtyard-suite",
      "hill-residence",
    ]);
  });

  it("resolves a room by slug and returns undefined for unknown slugs", () => {
    expect(getRoomBySlug("forest-room")?.name).toBe("Forest Room");
    expect(getRoomBySlug("no-such-room")).toBeUndefined();
  });

  it("gives every room the fields the gallery and detail pages render", () => {
    for (const room of rooms) {
      expect(room.slug).toMatch(/^[a-z0-9-]+$/);
      expect(room.name.length).toBeGreaterThan(0);
      expect(room.description.length).toBeGreaterThan(0);
      expect(room.area).toMatch(/SQ M$/);
      expect(room.bed.length).toBeGreaterThan(0);
      expect(room.features.length).toBeGreaterThan(0);
      expect(room.conceptRateThb).toBeGreaterThan(0);
    }
  });

  it("keeps guest counts inside the capacity the booking form accepts", () => {
    for (const room of rooms) {
      expect(room.guests).toBeGreaterThanOrEqual(1);
      expect(room.guests).toBeLessThanOrEqual(site.stay.maxGuests);
    }
  });

  it("gives every image a real source, intrinsic size and meaningful alt text", () => {
    for (const room of rooms) {
      for (const image of getRoomImages(room)) {
        expect(image.src.startsWith("/nara-house/images/")).toBe(true);
        expect(image.width).toBeGreaterThan(0);
        expect(image.height).toBeGreaterThan(0);
        // Decorative alt is fine elsewhere, but a room photograph carries
        // information a screen-reader user would otherwise lose.
        expect(image.alt.length).toBeGreaterThan(12);
      }
    }
  });

  it("does not reuse a hero image between rooms", () => {
    const sources = rooms.map((room) => room.heroImage.src);
    expect(new Set(sources).size).toBe(sources.length);
  });

  it("formats the gallery progress counter as a padded fraction", () => {
    expect(formatRoomProgress(0)).toBe("01 / 03");
    expect(formatRoomProgress(2)).toBe("03 / 03");
  });

  it("clamps an out-of-range progress index instead of printing nonsense", () => {
    expect(formatRoomProgress(-4)).toBe("01 / 03");
    expect(formatRoomProgress(99)).toBe("03 / 03");
  });
});
