import { rooms } from "@/content/rooms";
import { site } from "@/content/site";

/**
 * Booking validation.
 *
 * This is a *concept* flow: nothing is transmitted, stored or charged. The
 * validation exists so the demo behaves like a credible reservation form under
 * keyboard and screen-reader use, and it is written as pure functions with an
 * injected `today` so the date rules can be tested without freezing the clock.
 */

export const ANY_ROOM = "any" as const;

export type BookingField =
  | "checkIn"
  | "checkOut"
  | "guests"
  | "roomPreference"
  | "email";

export type BookingValues = {
  checkIn: string;
  checkOut: string;
  guests: string;
  roomPreference: string;
  email: string;
};

export type BookingErrors = Partial<Record<BookingField, string>>;

export type BookingValidation = {
  isValid: boolean;
  errors: BookingErrors;
  /** Number of nights, or null when the dates are not both valid. */
  nights: number | null;
};

export const emptyBookingValues: BookingValues = {
  checkIn: "",
  checkOut: "",
  guests: "2",
  roomPreference: ANY_ROOM,
  email: "",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_NIGHT = 86_400_000;

/**
 * Parses `YYYY-MM-DD` as a UTC midnight timestamp.
 *
 * Using UTC rather than local time keeps the night count stable across
 * timezones and daylight-saving boundaries, and rejects impossible dates like
 * `2025-02-31` that `Date` would otherwise roll forward.
 */
export function parseIsoDate(value: string): Date | null {
  if (!ISO_DATE.test(value)) return null;
  const [yearPart, monthPart, dayPart] = value.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Today at UTC midnight — the earliest selectable arrival. */
export function startOfToday(now: Date = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

/** `YYYY-MM-DD` for use as the `min` attribute on the date inputs. */
export function toIsoDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function countNights(checkIn: Date, checkOut: Date): number {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / MS_PER_NIGHT);
}

const validRoomPreferences = new Set<string>([
  ANY_ROOM,
  ...rooms.map((room) => room.slug),
]);

/**
 * Deliberately permissive email check. The goal is to catch obvious typos
 * without rejecting valid-but-unusual addresses, since nothing is ever sent.
 */
function isPlausibleEmail(value: string): boolean {
  if (value.length > 254 || /\s/.test(value)) return false;
  const at = value.indexOf("@");
  if (at <= 0 || at !== value.lastIndexOf("@")) return false;
  const domain = value.slice(at + 1);
  if (domain.length < 3 || !domain.includes(".")) return false;
  if (domain.startsWith(".") || domain.endsWith(".") || domain.includes(".."))
    return false;
  return true;
}

export function validateBooking(
  values: BookingValues,
  today: Date = startOfToday(),
): BookingValidation {
  const errors: BookingErrors = {};
  const minimumNights = site.stay.minimumNights;

  const checkIn = parseIsoDate(values.checkIn);
  const checkOut = parseIsoDate(values.checkOut);

  if (!values.checkIn) {
    errors.checkIn = "Please choose an arrival date.";
  } else if (!checkIn) {
    errors.checkIn = "Please enter the arrival date as YYYY-MM-DD.";
  } else if (checkIn.getTime() < today.getTime()) {
    errors.checkIn = "Arrival cannot be in the past.";
  }

  if (!values.checkOut) {
    errors.checkOut = "Please choose a departure date.";
  } else if (!checkOut) {
    errors.checkOut = "Please enter the departure date as YYYY-MM-DD.";
  }

  let nights: number | null = null;
  if (checkIn && checkOut && !errors.checkIn && !errors.checkOut) {
    nights = countNights(checkIn, checkOut);
    if (nights <= 0) {
      errors.checkOut = "Departure must be after arrival.";
      nights = null;
    } else if (nights < minimumNights) {
      errors.checkOut = `The house asks for a minimum stay of ${minimumNights} nights.`;
    }
  }

  const guests = Number(values.guests);
  if (!values.guests) {
    errors.guests = "Please tell us how many guests are coming.";
  } else if (!Number.isInteger(guests) || guests < 1) {
    errors.guests = "Guests must be a whole number of one or more.";
  } else if (guests > site.stay.maxGuests) {
    errors.guests = `The house accommodates up to ${site.stay.maxGuests} guests.`;
  }

  if (!validRoomPreferences.has(values.roomPreference)) {
    errors.roomPreference = "Please choose one of the available rooms.";
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = "Please add an email address so we can reply.";
  } else if (!isPlausibleEmail(email)) {
    errors.email = "That email address does not look complete.";
  }

  return { isValid: Object.keys(errors).length === 0, errors, nights };
}

/** Concept pricing only — never rendered without its accompanying label. */
export function formatConceptRate(amountThb: number): string {
  return `THB ${amountThb.toLocaleString("en-US")}`;
}
