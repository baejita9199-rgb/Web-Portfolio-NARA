"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { HorizontalGallery } from "@/components/media/HorizontalGallery";
import { Reveal } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { formatRoomProgress, rooms } from "@/content/rooms";
import { imageSizes } from "@/lib/media";
import styles from "./RoomGallery.module.css";

/**
 * Section 04 — Rooms of Light.
 *
 * The visual centre of the page. It scrolls sideways on its own, driven by
 * ordinary touch, trackpad, drag and arrow keys — the page's vertical scroll is
 * never captured or converted, so nothing is ever pinned beneath the visitor.
 */
export function RoomGallery() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleActiveIndexChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <section id="rooms" className={styles.section} aria-labelledby="rooms-title">
      <div className={styles.header}>
        <SectionLabel number="04" label="Rooms of Light" tone="dark" />
        <Reveal>
          <h2 id="rooms-title" className={styles.title}>
            Three rooms, each built around a different hour of the day.
          </h2>
        </Reveal>
      </div>

      <HorizontalGallery
        ariaLabel="Rooms at NARA HOUSE"
        count={rooms.length}
        onActiveIndexChange={handleActiveIndexChange}
        previousLabel="Previous room"
        nextLabel="Next room"
        className={styles.gallery}
        controlsSlot={
          <div className={styles.status}>
            {/* The names are stacked and crossfaded rather than swapped, so the
                label changes as quietly as the plates do. */}
            <span className={styles.nameStack} aria-hidden="true">
              {rooms.map((room, index) => (
                <span
                  key={room.slug}
                  className={styles.name}
                  data-active={index === activeIndex ? "true" : "false"}
                >
                  {room.name}
                </span>
              ))}
            </span>
            <span className={styles.progress} role="status" aria-live="polite">
              {rooms[activeIndex]?.name} — {formatRoomProgress(activeIndex)}
            </span>
          </div>
        }
      >
        {rooms.map((room, index) => (
          <article
            key={room.slug}
            className={styles.item}
            data-gallery-item
            aria-label={`${room.name}, ${formatRoomProgress(index)}`}
          >
            <div className={styles.itemMedia}>
              <Image
                src={room.heroImage.src}
                alt={room.heroImage.alt}
                fill
                sizes={imageSizes.gallery}
                className={styles.image}
              />
            </div>

            <div className={styles.itemBody}>
              <h3 className={styles.itemTitle}>{room.name}</h3>
              <p className={styles.itemDescription}>{room.description}</p>

              <dl className={styles.specs}>
                <div className={styles.spec}>
                  <dt>Area</dt>
                  <dd>{room.area}</dd>
                </div>
                <div className={styles.spec}>
                  <dt>Guests</dt>
                  <dd>{room.guests}</dd>
                </div>
                <div className={styles.spec}>
                  <dt>Bed</dt>
                  <dd>{room.bed}</dd>
                </div>
                <div className={styles.spec}>
                  <dt>Feature</dt>
                  <dd>{room.features[0]}</dd>
                </div>
              </dl>

              <Link className={styles.itemLink} href={`/rooms/${room.slug}`}>
                <span>View room</span>
                <span aria-hidden="true">&#8594;</span>
                <span className="visually-hidden">— {room.name}</span>
              </Link>
            </div>

            {room.gallery[0] ? (
              <div className={styles.itemDetail}>
                <Image
                  src={room.gallery[0].src}
                  alt={room.gallery[0].alt}
                  fill
                  sizes={imageSizes.narrow}
                  className={styles.image}
                />
              </div>
            ) : null}
          </article>
        ))}
      </HorizontalGallery>
    </section>
  );
}
