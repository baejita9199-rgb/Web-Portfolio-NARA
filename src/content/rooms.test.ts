import { describe, expect, it } from "vitest";
import {
  formatRoomProgress,
  getOtherRooms,
  getRoomBySlug,
  getRoomImages,
  getRoomSlugs,
  rooms,
  sharedRoomFittings,
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

describe("room detail content", () => {
  it("gives every room enough prose to justify its own page", () => {
    for (const room of rooms) {
      expect(room.story.length, room.slug).toBeGreaterThanOrEqual(3);
      for (const paragraph of room.story) {
        expect(paragraph.length).toBeGreaterThan(80);
      }
    }
  });

  it("describes the light, the season and the kind of stay it suits", () => {
    for (const room of rooms) {
      expect(room.orientation.length, room.slug).toBeGreaterThan(40);
      expect(room.seasonNote.length, room.slug).toBeGreaterThan(40);
      expect(room.bestFor.length, room.slug).toBeGreaterThan(20);
    }
  });

  it("states plain facts a guest would want before booking", () => {
    const expected = ["Outlook", "Bathroom", "Climate", "Sound", "Steps"];
    for (const room of rooms) {
      const labels = room.details.map((detail) => detail.label);
      expect(labels, room.slug).toEqual(expected);
      for (const detail of room.details) {
        expect(detail.value.length).toBeGreaterThan(10);
      }
    }
  });

  it("draws each room's materials from the shared material vocabulary", () => {
    const vocabulary = new Set([
      "Local timber",
      "Hand-finished plaster",
      "Natural stone",
      "Woven textile",
    ]);
    for (const room of rooms) {
      expect(room.materials.length).toBeGreaterThan(0);
      for (const material of room.materials) {
        expect(vocabulary.has(material), `${room.slug}: ${material}`).toBe(true);
      }
    }
  });

  it("gives every room a plate sequence rather than a single photograph", () => {
    for (const room of rooms) {
      expect(room.gallery.length, room.slug).toBeGreaterThanOrEqual(3);
    }
  });

  it("does not repeat one image inside a single room", () => {
    for (const room of rooms) {
      const sources = getRoomImages(room).map((image) => image.src);
      expect(new Set(sources).size, room.slug).toBe(sources.length);
    }
  });

  it("lists the shared fittings once, not per room", () => {
    expect(sharedRoomFittings.length).toBeGreaterThan(3);
    for (const room of rooms) {
      for (const fitting of sharedRoomFittings) {
        expect(room.features).not.toContain(fitting);
      }
    }
  });

  it("prices the rooms in ascending order of size", () => {
    const byArea = [...rooms].sort(
      (a, b) => Number.parseInt(a.area, 10) - Number.parseInt(b.area, 10),
    );
    const rates = byArea.map((room) => room.conceptRateThb);
    expect([...rates].sort((a, b) => a - b)).toEqual(rates);
  });
});

describe("other rooms", () => {
  it("excludes the room you are looking at", () => {
    for (const room of rooms) {
      const others = getOtherRooms(room.slug);
      expect(others).toHaveLength(rooms.length - 1);
      expect(others.some((other) => other.slug === room.slug)).toBe(false);
    }
  });

  it("returns everything for an unknown slug", () => {
    expect(getOtherRooms("no-such-room")).toHaveLength(rooms.length);
  });
});
