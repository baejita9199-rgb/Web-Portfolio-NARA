import type { MetadataRoute } from "next";
import { journalEntries } from "@/content/journal";
import { rooms } from "@/content/rooms";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nara-house.example";

export default function sitemap(): MetadataRoute.Sitemap {
  // A fixed build date keeps successive builds byte-identical, which makes the
  // output diffable and avoids a meaningless change on every deploy.
  const lastModified = "2025-11-04";

  return [
    { url: siteUrl, lastModified, changeFrequency: "monthly", priority: 1 },
    {
      url: `${siteUrl}/journal`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...rooms.map((room) => ({
      url: `${siteUrl}/rooms/${room.slug}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...journalEntries.map((entry) => ({
      url: `${siteUrl}/journal/${entry.slug}`,
      lastModified: entry.publishedAt,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
