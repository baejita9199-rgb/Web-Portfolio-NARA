import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingTrigger } from "@/components/booking/BookingTrigger";
import { getRoomBySlug, getRoomSlugs, rooms } from "@/content/rooms";
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

  const others = rooms.filter((entry) => entry.slug !== room.slug);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <Link href="/#rooms" className={styles.eyebrowLink}>
              Rooms
            </Link>
            <span aria-hidden="true">/</span>
            <span>{room.name}</span>
          </p>
          <h1 className={styles.title}>{room.name}</h1>
          <p className={styles.lede}>{room.description}</p>
        </header>

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

        <div className={styles.detail}>
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

          <div className={styles.features}>
            <h2 className={styles.featuresTitle}>In the room</h2>
            <ul role="list" className={styles.featureList}>
              {room.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <p className={styles.rateNote}>
              Concept pricing shown for demonstration only. No reservation can
              be made.
            </p>
            <BookingTrigger>Check availability</BookingTrigger>
          </div>
        </div>

        {room.gallery.length > 0 ? (
          <div className={styles.gallery}>
            {room.gallery.map((image) => (
              <figure key={image.src} className={styles.galleryFigure}>
                <div className={styles.galleryFrame}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes={imageSizes.half}
                    className={styles.image}
                  />
                </div>
              </figure>
            ))}
          </div>
        ) : null}

        <nav className={styles.others} aria-label="Other rooms">
          <p className={styles.othersTitle}>Other rooms</p>
          <ul role="list" className={styles.othersList}>
            {others.map((other) => (
              <li key={other.slug}>
                <Link href={`/rooms/${other.slug}`} className={styles.otherLink}>
                  <span>{other.name}</span>
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
