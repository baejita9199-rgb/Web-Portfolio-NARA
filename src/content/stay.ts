import type { MenuCourse, StayDetail } from "./types";

/**
 * Practical information, written plainly.
 *
 * A hospitality site that only ever describes atmosphere is not much use to
 * someone deciding whether to come. All of this is fictional, but it is written
 * the way a real house would write it — including the parts that are not
 * flattering.
 */

export const arrivalDetails: readonly StayDetail[] = [
  {
    label: "Getting here",
    value: "Roughly ninety minutes by road from the nearest regional airport.",
    note: "The last four kilometres are unsealed and slow. This is deliberate.",
  },
  {
    label: "Private transfer",
    value: "Arranged on request, in both directions.",
    note: "Worth taking on arrival; the turning is easy to miss in the dark.",
  },
  {
    label: "Arrival",
    value: "From 15:00. Departure by 11:00.",
    note: "Earlier arrivals can leave bags and use the courtyard.",
  },
  {
    label: "Minimum stay",
    value: "Two nights, three over the cold months.",
  },
  {
    label: "Who stays",
    value: "Adults and children over twelve.",
  },
  {
    label: "Getting around",
    value: "Bicycles at the house. A car is useful but not required.",
  },
];

export const houseRhythm: readonly StayDetail[] = [
  {
    label: "06:00",
    value: "Tea in the kitchen for anyone already awake.",
  },
  {
    label: "07:30",
    value: "Breakfast beside the garden, served until it stops.",
  },
  {
    label: "Midday",
    value: "The house is quiet. Nothing is scheduled.",
  },
  {
    label: "16:00",
    value: "The courtyard turns. Tea again, if anyone wants it.",
  },
  {
    label: "19:00",
    value: "Dinner at the long table, one sitting.",
  },
  {
    label: "After",
    value: "Lamps on the terrace stay lit as long as somebody is out there.",
  },
];

/**
 * The sample menu now spans the year rather than a single day — the seasonal
 * claim only means something if you can see the season change.
 */
export const seasonalMenu: readonly MenuCourse[] = [
  {
    time: "Morning",
    season: "Year round",
    dish: "Rice porridge, garden herbs, preserved vegetables and local tea.",
    note: "Thin rather than thick, with ginger and whatever herb is strongest.",
  },
  {
    time: "Evening",
    season: "Cool months",
    dish: "Charcoal-grilled root vegetables, fermented greens, sticky rice and a clear broth.",
    note: "Eaten late, when the terrace has already gone cold.",
  },
  {
    time: "Evening",
    season: "Hot months",
    dish: "Raw and lightly dressed vegetables, grilled river fish, herb salads and cold rice.",
    note: "Served in the courtyard once the stone has lost the day's heat.",
  },
  {
    time: "Evening",
    season: "Wet months",
    dish: "Slow-braised greens, mushrooms from the ridge, chilli paste and northern-style shared dishes.",
    note: "The mushrooms last about three weeks and then are gone.",
  },
];

export const tableNotes = [
  "Dinner is one sitting, at one table, and is included.",
  "Dietary requirements are straightforward to accommodate with a day's notice.",
  "There is no wine list. There is usually wine.",
  "Nothing is served that had to travel further than the guests did.",
] as const;

/** What the concept rate is stated to include, so the number has context. */
export const included = [
  "Breakfast and dinner, daily",
  "Tea and filtered water throughout",
  "One guided walk or workshop visit per stay",
  "Bicycles and route notes",
  "Laundry, for stays of four nights or more",
] as const;
