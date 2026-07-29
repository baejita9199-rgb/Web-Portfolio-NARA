import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { ActionLink } from "@/components/ui/Action";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { formatJournalDate, getJournalEntriesByDate } from "@/content/journal";
import { imageSizes } from "@/lib/media";
import styles from "./JournalPreview.module.css";

/**
 * Section 08 — Notes from the House.
 *
 * A journal index set as a list of rules and type rather than a row of cards.
 * Each entry links to a real route, so the section is a genuine preview of the
 * journal rather than a decorative stand-in.
 */
export function JournalPreview() {
  const entries = getJournalEntriesByDate();

  return (
    <section
      id="journal"
      className={styles.section}
      aria-labelledby="journal-title"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <SectionLabel number="08" label="Notes from the House" />
          <Reveal>
            <h2 id="journal-title" className={styles.title}>
              Notes from the house.
            </h2>
          </Reveal>
          <Reveal>
            <p className={styles.lede}>
              Occasional writing on materials, weather and the routines of the
              kitchen and the garden.
            </p>
          </Reveal>
        </header>

        <ol className={styles.list} role="list">
          {entries.map((entry, index) => (
            <li key={entry.slug} className={styles.row}>
              <Link href={`/journal/${entry.slug}`} className={styles.rowLink}>
                <span className={styles.rowMeta}>
                  <span className={styles.rowIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <time dateTime={entry.publishedAt}>
                    {formatJournalDate(entry.publishedAt)}
                  </time>
                  <span className={styles.rowCategory}>{entry.category}</span>
                </span>

                <span className={styles.rowBody}>
                  <span className={styles.rowTitle}>{entry.title}</span>
                  <span className={styles.rowExcerpt}>{entry.excerpt}</span>
                  <span className={styles.rowReading}>{entry.readingTime}</span>
                </span>

                {/* A quiet preview that fades up on hover or keyboard focus.
                    It is decorative — the row is fully legible without it. */}
                {entry.image ? (
                  <span className={styles.rowPreview} aria-hidden="true">
                    <Image
                      src={entry.image.src}
                      alt=""
                      fill
                      sizes={imageSizes.narrow}
                      className={styles.rowPreviewImage}
                    />
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ol>

        <div className={styles.footer}>
          <ActionLink href="/journal" variant="quiet">
            Read the journal
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
