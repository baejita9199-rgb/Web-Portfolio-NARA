import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { site } from "@/content/site";
import { BookingModal } from "./BookingModal";

/** A date comfortably in the future, so "today" never invalidates the fixture. */
function futureDates() {
  const base = new Date();
  base.setUTCFullYear(base.getUTCFullYear() + 1);
  const checkIn = new Date(base);
  const checkOut = new Date(base);
  checkOut.setUTCDate(checkOut.getUTCDate() + 4);
  return {
    checkIn: checkIn.toISOString().slice(0, 10),
    checkOut: checkOut.toISOString().slice(0, 10),
  };
}

function fillValidEnquiry() {
  const { checkIn, checkOut } = futureDates();
  fireEvent.change(screen.getByLabelText("Check-in"), {
    target: { value: checkIn },
  });
  fireEvent.change(screen.getByLabelText("Check-out"), {
    target: { value: checkOut },
  });
  fireEvent.change(screen.getByLabelText("Guests"), { target: { value: "2" } });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "guest@example.com" },
  });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: /request the dates/i }));
}

describe("BookingModal — structure", () => {
  it("renders nothing while closed", () => {
    render(<BookingModal open={false} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("is a labelled modal dialog when open", () => {
    render(<BookingModal open onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Check availability");
  });

  it("states up front that the flow is fictional", () => {
    render(<BookingModal open onClose={vi.fn()} />);
    expect(screen.getByText(site.bookingDisclaimer)).toBeInTheDocument();
  });

  it("labels the sample rate as concept pricing", () => {
    render(<BookingModal open onClose={vi.fn()} />);
    expect(screen.getByText(/from thb 8,900 per night/i)).toBeInTheDocument();
    expect(screen.getByText(/concept pricing/i)).toBeInTheDocument();
  });

  it("offers every room plus a no-preference option", () => {
    render(<BookingModal open onClose={vi.fn()} />);
    const select = screen.getByLabelText("Room preference");

    expect(select).toHaveValue("any");
    expect(
      Array.from(select.querySelectorAll("option")).map((o) => o.textContent),
    ).toEqual([
      "No preference",
      "Forest Room",
      "Courtyard Suite",
      "Hill Residence",
    ]);
  });
});

describe("BookingModal — keyboard and focus", () => {
  it("moves focus into the dialog when it opens", async () => {
    render(<BookingModal open onClose={vi.fn()} />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /close the reservation panel/i }),
      ).toHaveFocus();
    });
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(<BookingModal open onClose={onClose} />);

    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes from the close button", () => {
    const onClose = vi.fn();
    render(<BookingModal open onClose={onClose} />);

    fireEvent.click(
      screen.getByRole("button", { name: /close the reservation panel/i }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("keeps Tab inside the dialog", async () => {
    render(<BookingModal open onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input, select, textarea",
      ),
    );
    const last = focusable[focusable.length - 1]!;
    last.focus();

    fireEvent.keyDown(document, { key: "Tab" });

    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });

  it("restores focus to the element that opened it", async () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = render(<BookingModal open onClose={vi.fn()} />);
    await waitFor(() => expect(trigger).not.toHaveFocus());

    rerender(<BookingModal open={false} onClose={vi.fn()} />);
    await waitFor(() => expect(trigger).toHaveFocus());

    trigger.remove();
  });

  it("locks page scrolling while open and releases it on close", () => {
    const { rerender } = render(<BookingModal open onClose={vi.fn()} />);
    expect(document.body.dataset.scrollLocked).toBe("true");

    rerender(<BookingModal open={false} onClose={vi.fn()} />);
    expect(document.body.dataset.scrollLocked).toBeUndefined();
  });
});

describe("BookingModal — validation", () => {
  it("blocks submission and lists the problems when the form is empty", () => {
    render(<BookingModal open onClose={vi.fn()} />);
    submit();

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText(site.submissionNotice)).not.toBeInTheDocument();
  });

  it("marks the offending field as invalid", () => {
    render(<BookingModal open onClose={vi.fn()} />);
    submit();

    expect(screen.getByLabelText("Check-in")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("moves focus to the first field that needs attention", async () => {
    render(<BookingModal open onClose={vi.fn()} />);
    submit();

    await waitFor(() => {
      expect(screen.getByLabelText("Check-in")).toHaveFocus();
    });
  });

  it("rejects a stay shorter than the minimum", () => {
    render(<BookingModal open onClose={vi.fn()} />);
    const { checkIn } = futureDates();
    const nextDay = new Date(checkIn);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    fireEvent.change(screen.getByLabelText("Check-in"), {
      target: { value: checkIn },
    });
    fireEvent.change(screen.getByLabelText("Check-out"), {
      target: { value: nextDay.toISOString().slice(0, 10) },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "guest@example.com" },
    });
    submit();

    expect(screen.getByRole("alert")).toHaveTextContent(/minimum stay/i);
  });

  it("clears a field's error as soon as it is edited", () => {
    render(<BookingModal open onClose={vi.fn()} />);
    submit();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid");

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "guest@example.com" },
    });
    expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
  });
});

describe("BookingModal — concept submission", () => {
  it("never contacts the network", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const beacon = vi.fn();
    vi.stubGlobal("navigator", { ...navigator, sendBeacon: beacon });
    const xhrOpen = vi.spyOn(XMLHttpRequest.prototype, "open");

    render(<BookingModal open onClose={vi.fn()} />);
    fillValidEnquiry();
    submit();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(beacon).not.toHaveBeenCalled();
    expect(xhrOpen).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it("does not let the form navigate away", () => {
    render(<BookingModal open onClose={vi.fn()} />);
    const form = screen.getByRole("dialog").querySelector("form")!;

    // No action and no method: there is nowhere for a native submit to go.
    expect(form).not.toHaveAttribute("action");
    expect(form).toHaveAttribute("novalidate");

    fillValidEnquiry();
    const event = new Event("submit", { bubbles: true, cancelable: true });
    fireEvent(form, event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("replaces the form with the fictional-submission notice", () => {
    render(<BookingModal open onClose={vi.fn()} />);
    fillValidEnquiry();
    submit();

    expect(screen.getByText(site.submissionNotice)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /request the dates/i }),
    ).not.toBeInTheDocument();
  });

  it("announces the outcome to assistive technology", () => {
    render(<BookingModal open onClose={vi.fn()} />);
    fillValidEnquiry();
    submit();

    expect(screen.getByRole("status")).toHaveTextContent(
      site.submissionNotice,
    );
  });

  it("summarises the selection without echoing the email address", () => {
    render(<BookingModal open onClose={vi.fn()} />);
    fillValidEnquiry();
    submit();

    expect(screen.getByText(/4 nights for 2 guests/i)).toBeInTheDocument();
    expect(screen.queryByText(/guest@example\.com/)).not.toBeInTheDocument();
  });
});
