import { journalEntries } from "./journal.entries";
import type { JournalEntry } from "./types";

export { journalEntries };

export function getJournalEntryBySlug(slug: string): JournalEntry | undefined {
  return journalEntries.find((entry) => entry.slug === slug);
}

export function getJournalSlugs(): string[] {
  return journalEntries.map((entry) => entry.slug);
}

/** Stable, locale-independent display date — avoids SSR/client hydration drift. */
export function formatJournalDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthIndex = Number(month) - 1;
  const monthName = months[monthIndex];
  if (!year || !monthName || !day) return isoDate;
  return `${monthName} ${Number(day)}, ${year}`;
}

/** Newest first, for the journal index and the home-page preview. */
export function getJournalEntriesByDate(): JournalEntry[] {
  return [...journalEntries].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

/** The three most recent entries, which is what the home page previews. */
export function getFeaturedJournalEntries(count = 3): JournalEntry[] {
  return getJournalEntriesByDate().slice(0, count);
}

/** Every distinct category, in first-appearance order — used by the index filter row. */
export function getJournalCategories(): string[] {
  return Array.from(new Set(journalEntries.map((entry) => entry.category)));
}

/** Other reading at the end of an article: same category first, then recency. */
export function getRelatedJournalEntries(
  slug: string,
  count = 2,
): JournalEntry[] {
  const current = getJournalEntryBySlug(slug);
  if (!current) return [];

  const others = getJournalEntriesByDate().filter(
    (entry) => entry.slug !== slug,
  );
  const sameCategory = others.filter(
    (entry) => entry.category === current.category,
  );
  const rest = others.filter((entry) => entry.category !== current.category);

  return [...sameCategory, ...rest].slice(0, count);
}

/** Word count of the prose blocks — used to sanity-check the reading times. */
export function countArticleWords(entry: JournalEntry): number {
  return entry.body.reduce((total, block) => {
    if (block.kind === "paragraph" || block.kind === "subhead") {
      return total + block.text.trim().split(/\s+/).length;
    }
    if (block.kind === "quote") {
      return total + block.text.trim().split(/\s+/).length;
    }
    if (block.kind === "list") {
      return (
        total +
        block.items.reduce(
          (sum, item) => sum + item.trim().split(/\s+/).length,
          0,
        )
      );
    }
    return total;
  }, 0);
}
