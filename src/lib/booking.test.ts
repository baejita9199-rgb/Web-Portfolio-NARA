import { describe, expect, it } from "vitest";
import { site } from "@/content/site";
import {
  countNights,
  emptyBookingValues,
  formatConceptRate,
  parseIsoDate,
  startOfToday,
  toIsoDateString,
  validateBooking,
  type BookingValues,
} from "./booking";

/** A fixed "today" so the date rules are not tested against the wall clock. */
const TODAY = new Date(Date.UTC(2026, 2, 10));

function values(overrides: Partial<BookingValues> = {}): BookingValues {
  return {
    ...emptyBookingValues,
    checkIn: "2026-03-20",
    checkOut: "2026-03-24",
    guests: "2",
    roomPreference: "forest-room",
    email: "guest@example.com",
    ...overrides,
  };
}

describe("date parsing", () => {
  it("accepts a well-formed ISO date", () => {
    const date = parseIsoDate("2026-03-20");
    expect(date?.toISOString()).toBe("2026-03-20T00:00:00.000Z");
  });

  it.each(["20-03-2026", "2026/03/20", "2026-3-20", "", "tomorrow"])(
    "rejects the malformed date %j",
    (input) => {
      expect(parseIsoDate(input)).toBeNull();
    },
  );

  it("rejects a date that does not exist rather than rolling it forward", () => {
    // `new Date("2026-02-31")` silently becomes 3 March; that must not pass.
    expect(parseIsoDate("2026-02-31")).toBeNull();
    expect(parseIsoDate("2026-13-01")).toBeNull();
  });

  it("accepts a real leap day and rejects a false one", () => {
    expect(parseIsoDate("2028-02-29")).not.toBeNull();
    expect(parseIsoDate("2026-02-29")).toBeNull();
  });

  it("counts nights between two dates", () => {
    const from = parseIsoDate("2026-03-20")!;
    const to = parseIsoDate("2026-03-24")!;
    expect(countNights(from, to)).toBe(4);
  });

  it("normalises today to UTC midnight and round-trips it", () => {
    const today = startOfToday(new Date("2026-03-10T21:45:00Z"));
    expect(toIsoDateString(today)).toBe("2026-03-10");
  });
});

describe("booking form validation", () => {
  it("accepts a complete, plausible enquiry", () => {
    const result = validateBooking(values(), TODAY);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.nights).toBe(4);
  });

  it("reports every empty required field at once", () => {
    const result = validateBooking(
      { ...emptyBookingValues, guests: "" },
      TODAY,
    );
    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors).sort()).toEqual([
      "checkIn",
      "checkOut",
      "email",
      "guests",
    ]);
  });

  it("refuses an arrival in the past", () => {
    const result = validateBooking(
      values({ checkIn: "2026-03-09", checkOut: "2026-03-14" }),
      TODAY,
    );
    expect(result.errors.checkIn).toMatch(/past/i);
  });

  it("accepts an arrival today", () => {
    const result = validateBooking(
      values({ checkIn: "2026-03-10", checkOut: "2026-03-13" }),
      TODAY,
    );
    expect(result.isValid).toBe(true);
  });

  it("refuses a departure before the arrival", () => {
    const result = validateBooking(
      values({ checkIn: "2026-03-24", checkOut: "2026-03-20" }),
      TODAY,
    );
    expect(result.errors.checkOut).toMatch(/after arrival/i);
    expect(result.nights).toBeNull();
  });

  it("refuses a departure on the arrival date", () => {
    const result = validateBooking(
      values({ checkIn: "2026-03-20", checkOut: "2026-03-20" }),
      TODAY,
    );
    expect(result.errors.checkOut).toBeDefined();
  });

  it("enforces the two-night minimum stay", () => {
    const result = validateBooking(
      values({ checkIn: "2026-03-20", checkOut: "2026-03-21" }),
      TODAY,
    );
    expect(result.errors.checkOut).toMatch(/minimum stay of 2 nights/i);
  });

  it("accepts a stay of exactly the minimum length", () => {
    const result = validateBooking(
      values({ checkIn: "2026-03-20", checkOut: "2026-03-22" }),
      TODAY,
    );
    expect(result.isValid).toBe(true);
    expect(result.nights).toBe(site.stay.minimumNights);
  });

  it.each(["0", "-2", "2.5", "abc"])(
    "refuses the guest count %j",
    (guests) => {
      const result = validateBooking(values({ guests }), TODAY);
      expect(result.errors.guests).toBeDefined();
    },
  );

  it("refuses more guests than the house holds", () => {
    const result = validateBooking(
      values({ guests: String(site.stay.maxGuests + 1) }),
      TODAY,
    );
    expect(result.errors.guests).toMatch(/up to 6 guests/i);
  });

  it("accepts 'no preference' and any real room slug", () => {
    expect(validateBooking(values({ roomPreference: "any" }), TODAY).isValid).toBe(
      true,
    );
    expect(
      validateBooking(values({ roomPreference: "hill-residence" }), TODAY).isValid,
    ).toBe(true);
  });

  it("refuses a room that does not exist", () => {
    const result = validateBooking(
      values({ roomPreference: "penthouse" }),
      TODAY,
    );
    expect(result.errors.roomPreference).toBeDefined();
  });

  it.each([
    "not-an-email",
    "no-at-sign.com",
    "two@@at.com",
    "trailing@dot.",
    "spaced address@example.com",
    "@example.com",
  ])("refuses the email %j", (email) => {
    const result = validateBooking(values({ email }), TODAY);
    expect(result.errors.email).toBeDefined();
  });

  it("accepts an address with a subdomain and a plus tag", () => {
    const result = validateBooking(
      values({ email: "first.last+stay@mail.example.co.uk" }),
      TODAY,
    );
    expect(result.isValid).toBe(true);
  });

  it("trims surrounding whitespace before judging the address", () => {
    const result = validateBooking(
      values({ email: "  guest@example.com  " }),
      TODAY,
    );
    expect(result.isValid).toBe(true);
  });
});

describe("concept pricing", () => {
  it("formats a rate with a currency prefix and thousands separators", () => {
    expect(formatConceptRate(8900)).toBe("THB 8,900");
    expect(formatConceptRate(18600)).toBe("THB 18,600");
  });
});
