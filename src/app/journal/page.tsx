import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { formatJournalDate, getJournalEntriesByDate } from "@/content/journal";
import { site } from "@/content/site";
import { imageSizes } from "@/lib/media";
import styles from "./journal.module.css";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Occasional writing from NARA HOUSE on materials, weather and the routines of the kitchen and the garden. A fictional hospitality concept.",
  alternates: { canonical: "/journal" },
};

export default function JournalIndexPage() {
  const entries = getJournalEntriesByDate();

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <SectionLabel label="Journal" />
          <h1 className={styles.title}>Notes from the house.</h1>
          <p className={styles.lede}>
            Short pieces written at {site.name} — on building with quiet
            materials, on the turn of the seasons, and on what arrives at the
            table each morning.
          </p>
        </header>

        <ol className={styles.list} role="list">
          {entries.map((entry) => (
            <li key={entry.slug} className={styles.row}>
              <Link href={`/journal/${entry.slug}`} className={styles.rowLink}>
                {entry.image ? (
                  <span className={styles.rowMedia}>
                    <Image
                      src={entry.image.src}
                      alt=""
                      fill
                      sizes={imageSizes.narrow}
                      className={styles.rowImage}
                    />
                  </span>
                ) : null}

                <span className={styles.rowBody}>
                  <span className={styles.rowMeta}>
                    <time dateTime={entry.publishedAt}>
                      {formatJournalDate(entry.publishedAt)}
                    </time>
                    <span className={styles.rowCategory}>{entry.category}</span>
                    <span>{entry.readingTime}</span>
                  </span>
                  <span className={styles.rowTitle}>{entry.title}</span>
                  <span className={styles.rowExcerpt}>{entry.excerpt}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <p className={styles.back}>
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">&#8592;</span> Return to the house
          </Link>
        </p>
      </div>
    </div>
  );
}
