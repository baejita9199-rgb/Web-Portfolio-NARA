"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { rooms } from "@/content/rooms";
import { site } from "@/content/site";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import {
  ANY_ROOM,
  emptyBookingValues,
  formatConceptRate,
  startOfToday,
  toIsoDateString,
  validateBooking,
  type BookingErrors,
  type BookingValues,
} from "@/lib/booking";
import { ActionButton } from "@/components/ui/Action";
import styles from "./BookingModal.module.css";

export type BookingModalProps = {
  open: boolean;
  onClose: () => void;
};

type Status = "editing" | "submitted";

/**
 * The concept reservation panel.
 *
 * Nothing here contacts a server. `onSubmit` calls `preventDefault`, validates
 * locally, and swaps the form for a notice stating plainly that no reservation
 * was made. No value is persisted, logged or transmitted, which is why the
 * fields can be ordinary uncontrolled-looking state with no cleanup.
 */
export function BookingModal({ open, onClose }: BookingModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [values, setValues] = useState<BookingValues>(emptyBookingValues);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [status, setStatus] = useState<Status>("editing");
  const [nights, setNights] = useState<number | null>(null);

  const titleId = useId();
  const descriptionId = useId();
  const errorSummaryId = useId();

  useBodyScrollLock(open);
  useFocusTrap(dialogRef, {
    active: open,
    onEscape: onClose,
    initialFocusRef: closeButtonRef,
  });

  const minimumDate = toIsoDateString(startOfToday());

  const update = (field: keyof BookingValues, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    // Clearing on edit keeps the error from nagging while it is being fixed.
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // Nothing is ever sent. This is the single most important line in the file.
    event.preventDefault();

    const result = validateBooking(values);
    setErrors(result.errors);
    if (!result.isValid) {
      const firstField = Object.keys(result.errors)[0];
      if (firstField) {
        const element = dialogRef.current?.querySelector<HTMLElement>(
          `[name="${firstField}"]`,
        );
        element?.focus();
      }
      return;
    }

    setNights(result.nights);
    setStatus("submitted");
  };

  const handleClose = () => {
    onClose();
    // Reset after the panel has gone so the content does not visibly change
    // while it is still on screen.
    window.setTimeout(() => {
      setStatus("editing");
      setValues(emptyBookingValues);
      setErrors({});
      setNights(null);
    }, 260);
  };

  if (!open) return null;

  const errorEntries = Object.entries(errors);

  return (
    <div className={styles.overlay} data-surface="dark">
      {/* A plain backdrop button rather than a click handler on a div, so the
          dismiss affordance is never announced as interactive content. */}
      <button
        type="button"
        className={styles.backdrop}
        onClick={handleClose}
        tabIndex={-1}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className={styles.header}>
          <p className={styles.eyebrow}>Concept reservation</p>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.close}
            onClick={handleClose}
          >
            <span aria-hidden="true">&#215;</span>
            <span className="visually-hidden">Close the reservation panel</span>
          </button>
        </div>

        {status === "submitted" ? (
          <div className={styles.body}>
            <h2 id={titleId} className={styles.title}>
              Thank you for looking.
            </h2>
            <p id={descriptionId} className={styles.notice} role="status">
              {site.submissionNotice}
            </p>
            {nights ? (
              <p className={styles.summary}>
                You selected {nights} {nights === 1 ? "night" : "nights"} for{" "}
                {values.guests}{" "}
                {Number(values.guests) === 1 ? "guest" : "guests"}.
              </p>
            ) : null}
            <ActionButton variant="primary" onClick={handleClose}>
              Return to the house
            </ActionButton>
          </div>
        ) : (
          <div className={styles.body}>
            <h2 id={titleId} className={styles.title}>
              Check availability
            </h2>
            <p id={descriptionId} className={styles.lede}>
              {site.bookingDisclaimer}
            </p>

            {errorEntries.length > 0 ? (
              <div
                id={errorSummaryId}
                className={styles.errorSummary}
                role="alert"
              >
                <p>Please review the following:</p>
                <ul>
                  {errorEntries.map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.row}>
                <Field
                  label="Check-in"
                  name="checkIn"
                  type="date"
                  min={minimumDate}
                  value={values.checkIn}
                  error={errors.checkIn}
                  onChange={(value) => update("checkIn", value)}
                />
                <Field
                  label="Check-out"
                  name="checkOut"
                  type="date"
                  min={values.checkIn || minimumDate}
                  value={values.checkOut}
                  error={errors.checkOut}
                  onChange={(value) => update("checkOut", value)}
                />
              </div>

              <div className={styles.row}>
                <Field
                  label="Guests"
                  name="guests"
                  type="number"
                  min="1"
                  max={String(site.stay.maxGuests)}
                  value={values.guests}
                  error={errors.guests}
                  onChange={(value) => update("guests", value)}
                />

                <SelectField
                  label="Room preference"
                  name="roomPreference"
                  value={values.roomPreference}
                  error={errors.roomPreference}
                  onChange={(value) => update("roomPreference", value)}
                />
              </div>

              <Field
                label="Email"
                name="email"
                type="email"
                autoComplete="off"
                value={values.email}
                error={errors.email}
                onChange={(value) => update("email", value)}
              />

              <p className={styles.rate}>
                <span className={styles.rateValue}>
                  From {formatConceptRate(site.stay.conceptRateFromThb)} per night
                </span>
                <span className={styles.rateNote}>
                  Concept pricing — illustrative only, not a real rate.
                </span>
              </p>

              <div className={styles.actions}>
                <ActionButton type="submit" variant="primary">
                  Request the dates
                </ActionButton>
                <p className={styles.privacy}>
                  No data is submitted, stored or sent anywhere.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  name: keyof BookingValues;
  type: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  autoComplete?: string;
};

function Field({
  label,
  name,
  type,
  value,
  error,
  onChange,
  min,
  max,
  autoComplete,
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <p className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className={styles.input}
        value={value}
        min={min}
        max={max}
        autoComplete={autoComplete}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      ) : null}
    </p>
  );
}

type SelectFieldProps = {
  label: string;
  name: keyof BookingValues;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function SelectField({ label, name, value, error, onChange }: SelectFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <p className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        name={name}
        className={styles.input}
        value={value}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value={ANY_ROOM}>No preference</option>
        {rooms.map((room) => (
          <option key={room.slug} value={room.slug}>
            {room.name}
          </option>
        ))}
      </select>
      {error ? (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      ) : null}
    </p>
  );
}
