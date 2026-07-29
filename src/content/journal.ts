import { assetDimensions, naraAssets } from "./assets";
import type { JournalEntry } from "./types";

const { images } = naraAssets;

export const journalEntries: readonly JournalEntry[] = [
  {
    slug: "on-building-with-quiet-materials",
    title: "On Building with Quiet Materials",
    excerpt:
      "A short note on timber, clay and the surfaces that change with light.",
    category: "Materials",
    publishedAt: "2025-11-04",
    readingTime: "4 min read",
    image: {
      src: images.journal01,
      ...assetDimensions.detail,
      alt: "Late light raking across a hand-finished plaster wall.",
    },
    body: [
      "The first decision was not a shape. It was a surface. Before any plan was drawn, samples of clay, lime and local timber were left outdoors for a season to see how they would age — which ones would grey gracefully, which would darken, which would hold the warmth of afternoon light long after the sun had moved on.",
      "Materials that behave quietly tend to be the ones that are worked by hand. A lime plaster wall is never flat. It carries the trace of the person who floated it, and it catches raking light in a way that changes hour by hour. A machine-perfect surface gives you the same wall at nine in the morning and five in the afternoon. A hand-finished one gives you two different rooms.",
      "Timber was taken from managed local stands and left largely untreated inside the rooms, oiled only where hands meet it — door pulls, the edge of a desk, the lip of a bath. Those are the places that will darken first, and they are meant to. A house should keep a record of the people who have stayed in it.",
      "None of this is a style. It is closer to a set of constraints: use what is near, work it by hand where the hand will be felt, and let the light do the decorating.",
    ],
  },
  {
    slug: "the-first-rain",
    title: "The First Rain",
    excerpt:
      "How the landscape shifts at the beginning of the wet season.",
    category: "Seasons",
    publishedAt: "2025-08-19",
    readingTime: "3 min read",
    image: {
      src: images.journal02,
      ...assetDimensions.landscape,
      alt: "Low cloud moving through a forested valley after rain.",
    },
    body: [
      "There is a week each year when the air changes before the sky does. It thickens. The forest, which has been dry and pale and full of sound, goes quiet for a day or two, as though holding its breath.",
      "Then the first rain arrives, usually in the late afternoon, and everything at once smells of earth. The path below the house darkens. The stone courtyard, which has been the hottest surface on the property, becomes the coolest within an hour.",
      "Guests who arrive in this week often ask whether they have come at a bad time. They have not. The valley is at its most legible when it is wet — the ridgelines separate into layers, the mist finds the contours, and from the terrace you can read the shape of the land the way you would read a drawing.",
      "By the second week the green has changed entirely. It is a heavier, more saturated colour, and it will hold until the cold months. The house is designed for both: deep eaves for the rain, and openings wide enough that the dry season still reaches the back of every room.",
    ],
  },
  {
    slug: "a-morning-table",
    title: "A Morning Table",
    excerpt:
      "Notes from the garden, kitchen and shared breakfast.",
    category: "Table",
    publishedAt: "2025-05-27",
    readingTime: "3 min read",
    image: {
      src: images.journal03,
      ...assetDimensions.editorial,
      alt: "A simple breakfast setting on a worn timber table beside a garden door.",
    },
    body: [
      "Breakfast is not a service here so much as a habit the house has. It begins in the garden, usually before six, with whatever is ready — herbs, a few greens, occasionally fruit from the two trees that were on the slope long before the house was.",
      "The kitchen is small on purpose. A small kitchen decides the menu for you: rice porridge most mornings, preserved vegetables from the previous season, eggs, and a pot of local tea that stays on the table long after the plates are cleared.",
      "The table itself is one plank, and it seats everyone staying that week. Guests are not obliged to speak to one another and often do not, which is its own kind of hospitality. The room is oriented east, so the light does most of the talking until about eight.",
      "What is served changes constantly and the shape of the morning never does. That seems to be the point.",
    ],
  },
];

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
