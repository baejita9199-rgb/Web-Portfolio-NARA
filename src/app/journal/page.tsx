import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  formatJournalDate,
  getJournalCategories,
  getJournalEntriesByDate,
} from "@/content/journal";
import { site } from "@/content/site";
import { imageSizes } from "@/lib/media";
import styles from "./journal.module.css";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Occasional writing from NARA HOUSE on materials, weather, craft and the routines of the kitchen and the garden. A fictional hospitality concept.",
  alternates: { canonical: "/journal" },
};

export default function JournalIndexPage() {
  const entries = getJournalEntriesByDate();
  const [lead, ...rest] = entries;
  const categories = getJournalCategories();

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <SectionLabel label="Journal" />
          <h1 className={styles.title}>Notes from the house.</h1>
          <p className={styles.lede}>
            Short pieces written at {site.name} — on building with quiet
            materials, on the turn of the seasons, on the people who make what
            fills the rooms, and on what arrives at the table each morning.
          </p>

          {/* A running head of subjects rather than a filter control: the whole
              archive is six pieces, so filtering it would be theatre. */}
          <p className={styles.subjects}>
            <span className={styles.subjectsLabel}>Subjects</span>
            {categories.map((category) => (
              <span key={category} className={styles.subject}>
                {category}
              </span>
            ))}
          </p>
        </header>

        {lead ? (
          <article className={styles.lead}>
            <Link href={`/journal/${lead.slug}`} className={styles.leadLink}>
              {lead.image ? (
                <span className={styles.leadMedia}>
                  <Image
                    src={lead.image.src}
                    alt=""
                    fill
                    priority
                    sizes={imageSizes.full}
                    className={styles.leadImage}
                  />
                </span>
              ) : null}

              <span className={styles.leadBody}>
                <span className={styles.rowMeta}>
                  <span className={styles.leadFlag}>Latest</span>
                  <span className={styles.rowCategory}>{lead.category}</span>
                  <time dateTime={lead.publishedAt}>
                    {formatJournalDate(lead.publishedAt)}
                  </time>
                  <span>{lead.readingTime}</span>
                </span>
                <span className={styles.leadTitle}>{lead.title}</span>
                <span className={styles.leadStandfirst}>{lead.standfirst}</span>
              </span>
            </Link>
          </article>
        ) : null}

        <ol className={styles.list} role="list">
          {rest.map((entry) => (
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
                    <span className={styles.rowCategory}>{entry.category}</span>
                    <time dateTime={entry.publishedAt}>
                      {formatJournalDate(entry.publishedAt)}
                    </time>
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
