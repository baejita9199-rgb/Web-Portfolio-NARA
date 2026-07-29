import { describe, expect, it } from "vitest";
import {
  countArticleWords,
  getFeaturedJournalEntries,
  getJournalCategories,
  getJournalEntriesByDate,
  getJournalEntryBySlug,
  getRelatedJournalEntries,
  journalEntries,
} from "./journal";

describe("journal collection", () => {
  it("carries a full archive rather than a token few entries", () => {
    expect(journalEntries.length).toBeGreaterThanOrEqual(6);
  });

  it("gives every entry a unique slug", () => {
    const slugs = journalEntries.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("sorts newest first", () => {
    const dates = getJournalEntriesByDate().map((entry) => entry.publishedAt);
    expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates);
  });

  it("previews only the most recent entries on the home page", () => {
    const featured = getFeaturedJournalEntries(3);
    expect(featured).toHaveLength(3);
    expect(featured[0]).toEqual(getJournalEntriesByDate()[0]);
  });

  it("never asks for more entries than exist", () => {
    expect(getFeaturedJournalEntries(99)).toHaveLength(journalEntries.length);
  });

  it("lists each subject once", () => {
    const categories = getJournalCategories();
    expect(new Set(categories).size).toBe(categories.length);
    expect(categories.length).toBeGreaterThan(1);
  });
});

describe("article structure", () => {
  it("gives every entry a standfirst and a substantial body", () => {
    for (const entry of journalEntries) {
      expect(entry.standfirst.length).toBeGreaterThan(40);
      expect(entry.body.length).toBeGreaterThanOrEqual(8);
    }
  });

  it("opens every article with prose rather than furniture", () => {
    for (const entry of journalEntries) {
      // The first block carries the drop cap, so it has to be a paragraph.
      expect(entry.body[0]?.kind).toBe("paragraph");
    }
  });

  it("breaks up every article with at least one subhead and one figure", () => {
    for (const entry of journalEntries) {
      const kinds = entry.body.map((block) => block.kind);
      expect(kinds, entry.slug).toContain("subhead");
      expect(kinds, entry.slug).toContain("figure");
    }
  });

  it("gives every figure real dimensions and meaningful alt text", () => {
    for (const entry of journalEntries) {
      for (const block of entry.body) {
        if (block.kind !== "figure") continue;
        expect(block.image.src.startsWith("/nara-house/images/")).toBe(true);
        expect(block.image.width).toBeGreaterThan(0);
        expect(block.image.height).toBeGreaterThan(0);
        expect(block.image.alt.length).toBeGreaterThan(12);
        expect(block.caption.length).toBeGreaterThan(12);
      }
    }
  });

  it("never leaves a list block empty", () => {
    for (const entry of journalEntries) {
      for (const block of entry.body) {
        if (block.kind !== "list") continue;
        expect(block.items.length).toBeGreaterThan(1);
      }
    }
  });

  it("states a reading time that matches the length of the piece", () => {
    for (const entry of journalEntries) {
      const words = countArticleWords(entry);
      const claimed = Number(entry.readingTime.replace(/\D/g, ""));
      // ~200 words per minute, allowing a generous margin either way.
      const estimated = words / 200;
      expect(claimed, `${entry.slug} (${words} words)`).toBeGreaterThanOrEqual(
        Math.floor(estimated) - 1,
      );
      expect(claimed, `${entry.slug} (${words} words)`).toBeLessThanOrEqual(
        Math.ceil(estimated) + 4,
      );
    }
  });
});

describe("related reading", () => {
  it("never suggests the article you are already reading", () => {
    for (const entry of journalEntries) {
      const related = getRelatedJournalEntries(entry.slug);
      expect(related.some((other) => other.slug === entry.slug)).toBe(false);
    }
  });

  it("returns the requested number of suggestions", () => {
    for (const entry of journalEntries) {
      expect(getRelatedJournalEntries(entry.slug, 2)).toHaveLength(2);
    }
  });

  it("prefers an entry from the same subject when one exists", () => {
    // "Materials" and "Craft" are distinct, so pick a subject with a sibling.
    const withSibling = journalEntries.find((entry) =>
      journalEntries.some(
        (other) =>
          other.slug !== entry.slug && other.category === entry.category,
      ),
    );

    if (!withSibling) return;
    const first = getRelatedJournalEntries(withSibling.slug, 1)[0];
    expect(first?.category).toBe(withSibling.category);
  });

  it("returns nothing for an unknown slug", () => {
    expect(getRelatedJournalEntries("no-such-entry")).toEqual([]);
  });
});

describe("lookup", () => {
  it("resolves by slug and returns undefined otherwise", () => {
    expect(getJournalEntryBySlug("the-first-rain")?.title).toBe(
      "The First Rain",
    );
    expect(getJournalEntryBySlug("nope")).toBeUndefined();
  });
});
