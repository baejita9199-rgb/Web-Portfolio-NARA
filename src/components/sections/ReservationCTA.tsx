"use client";

import { useBooking } from "@/components/booking/BookingProvider";
import { AmbientVideo } from "@/components/media/AmbientVideo";
import { FullBleedMedia } from "@/components/media/FullBleedMedia";
import { Reveal } from "@/components/motion/Reveal";
import { ActionButton } from "@/components/ui/Action";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { naraAssets } from "@/content/assets";
import { site } from "@/content/site";
import { arrivalDetails, houseRhythm } from "@/content/stay";
import { formatConceptRate } from "@/lib/booking";
import styles from "./ReservationCTA.module.css";

/**
 * Section 09 — Reservation.
 *
 * The closing invitation, written as a welcome rather than a conversion panel:
 * no countdown, no scarcity, no urgency. The practical detail beneath it is
 * deliberately plain — a site that only ever describes atmosphere is not much
 * use to somebody actually deciding whether to come.
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
        </div>
      </FullBleedMedia>

      <div className={styles.practical}>
        <div className={styles.practicalInner}>
          <div className={styles.practicalColumn}>
            <h3 className={styles.practicalTitle}>Coming here</h3>
            <dl className={styles.detailList}>
              {arrivalDetails.map((detail) => (
                <div key={detail.label} className={styles.detail}>
                  <dt>{detail.label}</dt>
                  <dd>
                    <span>{detail.value}</span>
                    {detail.note ? (
                      <span className={styles.detailNote}>{detail.note}</span>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={styles.practicalColumn}>
            <h3 className={styles.practicalTitle}>The shape of a day</h3>
            <dl className={styles.rhythmList}>
              {houseRhythm.map((moment) => (
                <div key={moment.label} className={styles.rhythm}>
                  <dt>{moment.label}</dt>
                  <dd>{moment.value}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.rhythmNote}>
              None of it is compulsory. Most guests ignore at least half.
            </p>
          </div>
        </div>

        <p className={styles.disclaimer}>{site.bookingDisclaimer}</p>
      </div>
    </section>
  );
}
