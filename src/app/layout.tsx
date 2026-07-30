import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { BookingProvider } from "@/components/booking/BookingProvider";
import { Footer } from "@/components/layout/Footer";
import { SiteNavigation } from "@/components/layout/SiteNavigation";
import { StudioCreditPill } from "@/components/layout/StudioCreditPill";
import { naraAssets } from "@/content/assets";
import { site } from "@/content/site";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-manrope",
  display: "swap",
});

/**
 * A stable absolute base is required for canonical and Open Graph URLs. It is
 * overridable so a preview deployment advertises its own address rather than
 * the production one.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://nara.jedsada-payakorn.com";

const description =
  "A fictional boutique retreat shaped by forest, natural materials and unhurried living. A hospitality concept project by Jedsada Creative Technology Studio.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NARA HOUSE — A Quiet Place to Return",
    template: "%s — NARA HOUSE",
  },
  description,
  applicationName: site.name,
  authors: [{ name: site.studio }],
  creator: site.studio,
  keywords: [
    "editorial web design",
    "hospitality concept",
    "boutique retreat",
    "art direction",
    "portfolio concept project",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "NARA HOUSE — A Quiet Place to Return",
    description,
    url: "/",
    locale: "en_US",
    images: [
      {
        url: naraAssets.images.ogNaraHouse,
        width: 1200,
        height: 630,
        alt: "NARA HOUSE — a fictional retreat set among forest and mountains.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NARA HOUSE — A Quiet Place to Return",
    description,
    images: [naraAssets.images.ogNaraHouse],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "design",
  // Stated in the machine-readable metadata as well as on the page itself.
  other: {
    "concept-project": "NARA HOUSE is a fictional brand created for portfolio demonstration.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f1ede4",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <BookingProvider>
          <SiteNavigation />
          <main id="main-content">{children}</main>
          <Footer />
          <StudioCreditPill />
        </BookingProvider>
      </body>
    </html>
  );
}
