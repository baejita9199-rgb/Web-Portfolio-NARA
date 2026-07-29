import { describe, expect, it } from "vitest";
import { journalEntries } from "./journal";
import { navigationLinks, sectionIndex, site } from "./site";

describe("navigation mapping", () => {
  const sectionIds = new Set(sectionIndex.map((section) => section.id));

  it("points every in-page link at a section that exists on the page", () => {
    for (const link of navigationLinks) {
      expect(link.href.startsWith("#")).toBe(true);
      expect(link.sectionId).toBeDefined();
      expect(sectionIds.has(link.sectionId as never)).toBe(true);
    }
  });

  it("keeps each link's href in step with its section id", () => {
    for (const link of navigationLinks) {
      expect(link.href).toBe(`#${link.sectionId}`);
    }
  });

  it("numbers the nine sections consecutively and without gaps", () => {
    expect(sectionIndex).toHaveLength(9);
    sectionIndex.forEach((section, index) => {
      expect(section.number).toBe(String(index + 1).padStart(2, "0"));
    });
  });

  it("gives every section a unique id", () => {
    expect(sectionIds.size).toBe(sectionIndex.length);
  });
});

describe("fictional-brand disclosure", () => {
  it("states that the brand is fictional in the footer disclaimer", () => {
    expect(site.disclaimer).toMatch(/fictional/i);
    expect(site.disclaimer).toMatch(/concept project/i);
  });

  it("states that no real reservation is possible", () => {
    expect(site.bookingDisclaimer).toMatch(/does not accept real reservations/i);
    expect(site.submissionNotice).toMatch(/no reservation has been submitted/i);
  });

  it("uses only reserved example contact details", () => {
    // `.example` is reserved by RFC 2606 and can never resolve to a real
    // business, which is the point for a fictional brand.
    expect(site.contact.email.endsWith(".example")).toBe(true);
    expect(site.contact.phone).toMatch(/0{3}/);
  });
});

describe("journal content", () => {
  it("gives every entry a unique slug and an ISO date", () => {
    const slugs = journalEntries.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const entry of journalEntries) {
      expect(entry.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(entry.body.length).toBeGreaterThan(0);
    }
  });
});
