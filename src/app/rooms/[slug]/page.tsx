import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingTrigger } from "@/components/booking/BookingTrigger";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  formatRoomProgress,
  getOtherRooms,
  getRoomBySlug,
  getRoomSlugs,
  rooms,
  sharedRoomFittings,
} from "@/content/rooms";
import { site } from "@/content/site";
import { formatConceptRate } from "@/lib/booking";
import { imageSizes } from "@/lib/media";
import styles from "./room.module.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getRoomSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  if (!room) return { title: "Room not found" };

  return {
    title: room.name,
    description: `${room.description} ${room.area}, up to ${room.guests} guests. A fictional room at NARA HOUSE, created for portfolio demonstration.`,
    alternates: { canonical: `/rooms/${room.slug}` },
    openGraph: {
      title: room.name,
      description: room.description,
      url: `/rooms/${room.slug}`,
      images: [{ url: room.heroImage.src }],
    },
  };
}

export default async function RoomPage({ params }: PageProps) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  if (!room) notFound();

  const index = rooms.findIndex((entry) => entry.slug === room.slug);
  const others = getOtherRooms(room.slug);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <Link href="/#rooms" className={styles.eyebrowLink}>
              Rooms
            </Link>
            <span aria-hidden="true">/</span>
            <span>{formatRoomProgress(index)}</span>
          </p>
          <h1 className={styles.title}>{room.name}</h1>
          <p className={styles.lede}>{room.description}</p>
        </header>
      </div>

      <div className={styles.heroWrap}>
        <div className={styles.heroFrame}>
          <Image
            src={room.heroImage.src}
            alt={room.heroImage.alt}
            fill
            priority
            sizes={imageSizes.full}
            className={styles.image}
          />
        </div>
      </div>

      <div className={styles.inner}>
        {/* Facts first: the things somebody decides on before they read prose. */}
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
            <dt>Concept rate</dt>
            <dd>From {formatConceptRate(room.conceptRateThb)}</dd>
          </div>
        </dl>

        <section className={styles.story} aria-labelledby="room-story">
          <SectionLabel label="The room" />
          <h2 id="room-story" className={styles.storyTitle}>
            {room.bestFor}
          </h2>
          <div className={styles.storyBody}>
            {room.story.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className={styles.plates} aria-label={`${room.name} in detail`}>
          {room.gallery.map((image, plateIndex) => (
            <figure
              key={image.src}
              className={styles.plate}
              data-plate={plateIndex + 1}
            >
              <div
                className={styles.plateFrame}
                style={{ aspectRatio: `${image.width} / ${image.height}` }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={imageSizes.half}
                  className={styles.image}
                />
              </div>
              <figcaption className={styles.plateCaption}>
                <span className={styles.plateIndex}>
                  {String(plateIndex + 1).padStart(2, "0")}
                </span>
                {image.alt}
              </figcaption>
            </figure>
          ))}
        </section>

        <section className={styles.columns} aria-labelledby="room-conditions">
          <h2 id="room-conditions" className="visually-hidden">
            Light, season and materials
          </h2>

          <div className={styles.column}>
            <p className={styles.columnTitle}>Light</p>
            <p className={styles.columnBody}>{room.orientation}</p>
          </div>

          <div className={styles.column}>
            <p className={styles.columnTitle}>Through the year</p>
            <p className={styles.columnBody}>{room.seasonNote}</p>
          </div>

          <div className={styles.column}>
            <p className={styles.columnTitle}>Made from</p>
            <ul role="list" className={styles.columnList}>
              {room.materials.map((material) => (
                <li key={material}>{material}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.factsSection} aria-labelledby="room-facts">
          <h2 id="room-facts" className={styles.factsTitle}>
            Plainly stated
          </h2>
          <dl className={styles.facts}>
            {room.details.map((detail) => (
              <div key={detail.label} className={styles.fact}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.fittings} aria-labelledby="room-fittings">
          <h2 id="room-fittings" className={styles.fittingsTitle}>
            In every room
          </h2>
          <ul role="list" className={styles.fittingsList}>
            {sharedRoomFittings.map((fitting) => (
              <li key={fitting}>{fitting}</li>
            ))}
          </ul>
        </section>

        <section className={styles.cta}>
          <p className={styles.ctaRate}>
            From {formatConceptRate(room.conceptRateThb)} per night
          </p>
          <p className={styles.ctaNote}>
            Concept pricing shown for demonstration only. No reservation can be
            made.
          </p>
          <BookingTrigger>Check availability</BookingTrigger>
        </section>

        <nav className={styles.others} aria-label="Other rooms">
          <p className={styles.othersTitle}>Other rooms</p>
          <ul role="list" className={styles.othersList}>
            {others.map((other) => (
              <li key={other.slug}>
                <Link href={`/rooms/${other.slug}`} className={styles.otherLink}>
                  <span className={styles.otherMedia}>
                    <Image
                      src={other.heroImage.src}
                      alt=""
                      fill
                      sizes={imageSizes.narrow}
                      className={styles.image}
                    />
                  </span>
                  <span className={styles.otherName}>{other.name}</span>
                  <span className={styles.otherMeta}>
                    {other.area} — {other.guests} guests
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className={styles.disclaimer}>{site.disclaimer}</p>
      </div>
    </div>
  );
}
