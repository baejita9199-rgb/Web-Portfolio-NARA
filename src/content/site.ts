import type { NavigationLink } from "./types";

export const site = {
  name: "NARA HOUSE",
  wordmark: ["NARA", "HOUSE"] as const,
  tagline: "A quiet place to return.",
  positioning: "A quiet retreat shaped by light, earth and time.",
  intro:
    "A private retreat shaped by forest, light and time.",
  location: {
    label: "Northern Thailand",
    detail: "Residence No. 01",
    coordinatesLabel: "18°N — 98°E",
  },
  studio: "Jedsada Creative Technology Studio",
  disclaimer:
    "Concept project created for portfolio demonstration. NARA HOUSE is a fictional hospitality brand and does not operate as a real accommodation.",
  bookingDisclaimer:
    "Concept project created for portfolio demonstration. NARA HOUSE is a fictional hospitality brand and does not accept real reservations.",
  submissionNotice:
    "This is a fictional booking flow created for portfolio demonstration. No reservation has been submitted.",
  contact: {
    // Fictional contact details only. Nothing here resolves to a real business.
    email: "stay@narahouse.example",
    phone: "+66 (0) 00 000 0000",
    address: "Residence No. 01, Northern Thailand",
  },
  stay: {
    minimumNights: 2,
    maxGuests: 6,
    conceptRateFromThb: 8900,
    notes: [
      "Minimum stay: 2 nights",
      "Private transfer available",
      "Seasonal dining included",
      "Adults and children over 12",
    ],
  },
} as const;

export const navigationLinks: readonly NavigationLink[] = [
  { label: "The House", href: "#the-house", sectionId: "the-house" },
  { label: "Rooms", href: "#rooms", sectionId: "rooms" },
  { label: "Experience", href: "#experience", sectionId: "experience" },
  { label: "Journal", href: "#journal", sectionId: "journal" },
];

/** Every section rendered on the single page, in document order. */
export const sectionIndex = [
  { id: "arrival", number: "01", title: "Arrival" },
  { id: "the-house", number: "02", title: "The House" },
  { id: "materials", number: "03", title: "Built with the Land" },
  { id: "rooms", number: "04", title: "Rooms of Light" },
  { id: "experience", number: "05", title: "A Day at NARA" },
  { id: "table", number: "06", title: "Seasonal Table" },
  { id: "surroundings", number: "07", title: "The Surroundings" },
  { id: "journal", number: "08", title: "Notes from the House" },
  { id: "reservation", number: "09", title: "Reservation" },
] as const;

export type SectionId = (typeof sectionIndex)[number]["id"];
