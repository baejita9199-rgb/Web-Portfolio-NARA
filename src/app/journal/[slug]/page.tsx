import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatJournalDate,
  getJournalEntryBySlug,
  getJournalSlugs,
} from "@/content/journal";
import { site } from "@/content/site";
import { imageSizes } from "@/lib/media";
import styles from "./article.module.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Every entry is known at build time, so all three pages are fully static. */
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
            <time dateTime={entry.publishedAt}>
              {formatJournalDate(entry.publishedAt)}
            </time>
            <span className={styles.category}>{entry.category}</span>
            <span>{entry.readingTime}</span>
          </p>
          <h1 className={styles.title}>{entry.title}</h1>
          <p className={styles.excerpt}>{entry.excerpt}</p>
        </header>

        {entry.image ? (
          <figure className={styles.figure}>
            <div className={styles.figureFrame}>
              <Image
                src={entry.image.src}
                alt={entry.image.alt}
                fill
                priority
                sizes={imageSizes.full}
                className={styles.figureImage}
              />
            </div>
          </figure>
        ) : null}

        <div className={styles.body}>
          {entry.body.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>

        <footer className={styles.footer}>
          <p className={styles.disclaimer}>{site.disclaimer}</p>
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
