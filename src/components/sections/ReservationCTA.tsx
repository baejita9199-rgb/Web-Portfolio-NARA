"use client";

import { useBooking } from "@/components/booking/BookingProvider";
import { AmbientVideo } from "@/components/media/AmbientVideo";
import { FullBleedMedia } from "@/components/media/FullBleedMedia";
import { Reveal } from "@/components/motion/Reveal";
import { ActionButton } from "@/components/ui/Action";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { naraAssets } from "@/content/assets";
import { site } from "@/content/site";
import { formatConceptRate } from "@/lib/booking";
import styles from "./ReservationCTA.module.css";

/**
 * Section 09 — Reservation.
 *
 * The closing invitation. It is written as a welcome rather than a conversion
 * panel: no countdown, no scarcity, no urgency — and the fictional nature of
 * the brand is stated in the section itself, not only in the footer.
 */
export function ReservationCTA() {
  const { open: openBooking } = useBooking();

  return (
    <section
      id="reservation"
      className={styles.section}
      aria-labelledby="reservation-title"
    >
      <FullBleedMedia
        height="tall"
        overlay="strong"
        align="center"
        media={
          <AmbientVideo
            desktopSrc={naraAssets.video.eveningLight}
            desktopFallbackSrc={naraAssets.video.eveningLightFallback}
            poster={naraAssets.posters.eveningLight}
            alt="A room at dusk, one lamp lit and the garden dark beyond the glass."
            description="Lamplight settling across a room as the last daylight leaves the garden."
            sizes="100vw"
          />
        }
      >
        <div className={styles.content}>
          <SectionLabel number="09" label="Reservation" tone="dark" />

          <Reveal>
            <h2 id="reservation-title" className={styles.title}>
              Stay for a while.
            </h2>
          </Reveal>

          <Reveal>
            <p className={styles.lede}>
              {site.name} welcomes a small number of guests throughout the year.
            </p>
          </Reveal>

          <Reveal className={styles.actions}>
            <ActionButton variant="primary" tone="dark" onClick={openBooking}>
              Check availability
            </ActionButton>
            {/* A button rather than a link: there is no contact address to
                navigate to for a fictional brand, and the enquiry belongs in
                the same concept panel as the dates. */}
            <ActionButton variant="secondary" tone="dark" onClick={openBooking}>
              Contact the house
            </ActionButton>
          </Reveal>

          <Reveal splitChildren as="ul" className={styles.notes}>
            {site.stay.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </Reveal>

          <Reveal className={styles.rate}>
            <p>
              <span className={styles.rateValue}>
                From {formatConceptRate(site.stay.conceptRateFromThb)} per night
              </span>
              <span className={styles.rateNote}>
                Concept pricing — illustrative only
              </span>
            </p>
          </Reveal>

          <p className={styles.disclaimer}>{site.bookingDisclaimer}</p>
        </div>
      </FullBleedMedia>
    </section>
  );
}
