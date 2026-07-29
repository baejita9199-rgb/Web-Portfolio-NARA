import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/editorial/ArticleBody";
import {
  formatJournalDate,
  getJournalEntryBySlug,
  getJournalSlugs,
  getRelatedJournalEntries,
} from "@/content/journal";
import { site } from "@/content/site";
import { imageSizes } from "@/lib/media";
import styles from "./article.module.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Every entry is known at build time, so all six pages are fully static. */
export function generateStaticParams() {
  return getJournalSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getJournalEntryBySlug(slug);
  if (!entry) return { title: "Entry not found" };

  return {
    title: entry.title,
    description: entry.excerpt,
    alternates: { canonical: `/journal/${entry.slug}` },
    openGraph: {
      type: "article",
      title: entry.title,
      description: entry.excerpt,
      publishedTime: entry.publishedAt,
      url: `/journal/${entry.slug}`,
      images: entry.image ? [{ url: entry.image.src }] : undefined,
    },
  };
}

export default async function JournalEntryPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getJournalEntryBySlug(slug);
  if (!entry) notFound();

  const related = getRelatedJournalEntries(entry.slug);

  /**
   * Article structured data is safe here because the route genuinely exists and
   * describes a piece of writing. Hotel/LodgingBusiness markup is deliberately
   * omitted site-wide so no search engine can mistake this concept for a real
   * business taking bookings.
   */
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.excerpt,
    datePublished: entry.publishedAt,
    articleSection: entry.category,
    author: { "@type": "Organization", name: site.studio },
    publisher: { "@type": "Organization", name: site.studio },
    isAccessibleForFree: true,
    ...(entry.image ? { image: entry.image.src } : {}),
  };

  return (
    <article className={styles.page}>
      <script
        type="application/ld+json"
        // Serialised from a local literal only — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.meta}>
            <Link href="/journal" className={styles.metaLink}>
              Journal
            </Link>
            <span className={styles.category}>{entry.category}</span>
            <time dateTime={entry.publishedAt}>
              {formatJournalDate(entry.publishedAt)}
            </time>
            <span>{entry.readingTime}</span>
          </p>
          <h1 className={styles.title}>{entry.title}</h1>
          <p className={styles.standfirst}>{entry.standfirst}</p>
        </header>
      </div>

      {entry.image ? (
        <figure className={styles.lead}>
          <div
            className={styles.leadFrame}
            style={{
              aspectRatio: `${entry.image.width} / ${entry.image.height}`,
            }}
          >
            <Image
              src={entry.image.src}
              alt={entry.image.alt}
              fill
              priority
              sizes={imageSizes.full}
              className={styles.leadImage}
            />
          </div>
        </figure>
      ) : null}

      <div className={styles.inner}>
        <ArticleBody blocks={entry.body} />

        <footer className={styles.footer}>
          <p className={styles.disclaimer}>{site.disclaimer}</p>

          {related.length > 0 ? (
            <nav className={styles.related} aria-label="More from the journal">
              <p className={styles.relatedTitle}>More from the journal</p>
              <ul role="list" className={styles.relatedList}>
                {related.map((other) => (
                  <li key={other.slug}>
                    <Link
                      href={`/journal/${other.slug}`}
                      className={styles.relatedLink}
                    >
                      <span className={styles.relatedCategory}>
                        {other.category}
                      </span>
                      <span className={styles.relatedName}>{other.title}</span>
                      <span className={styles.relatedExcerpt}>
                        {other.excerpt}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <p className={styles.back}>
            <Link href="/journal" className={styles.backLink}>
              <span aria-hidden="true">&#8592;</span> All journal entries
            </Link>
          </p>
        </footer>
      </div>
    </article>
  );
}
