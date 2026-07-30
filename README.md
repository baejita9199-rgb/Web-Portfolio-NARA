# NARA HOUSE

An editorial hospitality website for a **fictional** boutique retreat, built as a
concept project to demonstrate brand storytelling, cinematic art direction,
short-form video integration, parallax motion and a booking-focused user
experience.

> **NARA HOUSE is not a real business.** It does not exist, it cannot be booked,
> and every address, phone number and rate on the site is invented. The
> disclaimer appears in the footer, in the reservation section, inside the
> booking panel and in the page metadata.

---

## Quick start

```bash
npm install
npm run generate:media   # renders the placeholder stills and ambient clips
npm run dev              # http://localhost:3000
```

The generated media is committed, so `generate:media` is only needed after
changing an art-direction recipe.

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (flat config, `eslint-config-next`) |
| `npm run typecheck` | `tsc --noEmit`, strict |
| `npm run test` | Vitest unit suite |
| `npm run test:e2e` | Playwright suite (requires a build first) |
| `npm run generate:media` | Regenerate every placeholder image and clip |
| `npm run measure:performance` | Record LCP, CLS and load weight from a real browser |
| `npm run verify` | lint → typecheck → test → build |

### Configuration

Nothing has to be configured. Every variable is an override, and the defaults
are chosen so that an unconfigured build is a safe one. See
**[.env.example](.env.example)** for the full list and copy it to get started:

```bash
cp .env.example .env.local
```

The one worth knowing about is **`NEXT_PUBLIC_SITE_URL`**, the absolute base for
canonical URLs, Open Graph tags, `robots.txt` and `sitemap.xml`. It defaults to
`https://nara.jedsada-payakorn.com`, the origin the site is served from — the
same custom domain `wrangler.jsonc` routes. Override it only for a preview
deployment that should advertise its own origin, without a trailing slash, and
set it at **build** time: the `NEXT_PUBLIC_` prefix inlines it into the client
bundle, so `next start` is too late.

`FFMPEG_PATH` and `PORT` affect only media generation and the Playwright suite
respectively; both are documented in `.env.example`.

---

## Continuous integration

[`.github/workflows/verify.yml`](.github/workflows/verify.yml) runs `npm run
verify` — lint, typecheck, unit tests, production build — on every push and pull
request.

Node is pinned to **22.12.0**, the floor of the range `engines` declares
(`^20.19.0 || >=22.12.0`). CI runs the minimum rather than a newer runtime,
because that is what keeps the claim honest — development happens on a current
Node. The floor comes from rolldown, vite and `@vitejs/plugin-react`, which all
require `^20.19.0 || >=22.12.0`; 22.12.0 is preferred over 20.19.0 because the
Node 20 line reached end of life in April 2026.

It verifies only. There is no deployment step, and adding one is a separate
decision. The Playwright suite is also not in CI: it needs a browser download
and a built server, which is worth doing deliberately rather than by default.
Run it locally with `npm run build && npm run test:e2e`.

---

## Architecture

```
src/
  app/                     Routes, metadata, robots, sitemap, design tokens
    globals.css            Palette, fluid type scale, spacing, motion, focus
    page.tsx               The nine-section narrative
    journal/               Index + six article routes (statically generated)
    rooms/[slug]/          Three room routes (statically generated)
  components/
    booking/               Concept reservation panel + provider
    editorial/             ArticleBody — renders typed article blocks
    layout/                SiteNavigation, Footer
    media/                 AmbientVideo, EditorialImage, ParallaxMedia,
                           SplitMediaText, FullBleedMedia, HorizontalGallery,
                           ImageCaption
    motion/                Reveal / ImageReveal, ReducedMotionFallback
    sections/              One component per numbered section
    ui/                    Action buttons and links, SectionLabel
  content/                 The entire content model — every string lives here
    journal.entries.ts     Six long-form articles as typed blocks
    stay.ts                Practical detail: arrival, the day's rhythm, menu
  hooks/                   useReducedMotion, useMediaQuery, useIntersectionVideo,
                           useParallax, useScrollDirection, useViewportSize,
                           useDocumentVisibility, useFocusTrap, useBodyScrollLock
  lib/                     gsap registration, media source selection, booking rules
scripts/                   Placeholder generator (sharp + ffmpeg)
e2e/                       Playwright specs
```

**Stack.** Next.js 16 (App Router) · React 19 · TypeScript (strict) · CSS Modules ·
GSAP + ScrollTrigger.

There is deliberately **one** styling system and **one** animation runtime. No
Tailwind, no Framer Motion, no Lenis, no Three.js. Native scrolling is never
intercepted, wrapped or smoothed.

### Content model

Nothing is hard-coded in a component. `src/content` holds flat, serialisable,
slug-addressable data (`Room`, `JournalEntry`, `Experience`, `DayChapter`,
`StayDetail`, `MenuCourse`) that could be swapped for a CMS without touching the
components that render it.

Articles are modelled as a sequence of typed blocks rather than a flat string
array:

```ts
type ArticleBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "subhead"; text: string }
  | { kind: "quote"; text: string; attribution?: string }
  | { kind: "figure"; image: ImageAsset; caption: string }
  | { kind: "list"; title?: string; items: string[] };
```

Long-form editorial needs subheads, pull quotes and captioned plates to hold a
reader. Modelling them explicitly keeps that structure in the content layer
rather than smuggling markup into prose, and lets `ArticleBody` give figures and
quotes a wider column than the 62-character reading measure.

---

## The video system

Every clip is short (5–6 s), silent, looping and atmospheric. `AmbientVideo` owns
all of the rules so no section has to remember them:

- `muted`, `playsInline`, `loop`, no controls, `aria-hidden`
- **Plays only when on screen *and* in a visible tab** — playback is the product
  of `enabled && isInView && documentVisible`
- Sources are attached to the DOM only after the clip approaches the viewport
  (`rootMargin: 300px`), so nothing below the fold is fetched on load
- `preload` is `none` until then, `metadata` after; only the hero starts at
  `metadata`
- The poster is a real `next/image` beneath the clip, not the `poster`
  attribute — responsive, and it stays as the fallback for a failed load, a
  refused autoplay or a reduced-motion visitor
- A rejected `play()` promise is swallowed deliberately (it is the normal result
  of scrolling quickly) and never logged

Placement alternates so two video sections are never adjacent: video (01) →
stills (02–04) → one clip inside a timeline of stills (05) → one clip (06) →
stills (07–08) → one clip (09).

## The parallax system

`useParallax` scrubs a **transform only** across the time an element spends in
the viewport, inside a `gsap.context()` scoped to the trigger — one `revert()`
removes the tween, its ScrollTrigger and every inline style it wrote.

- Speed is clamped to ±0.15 in the hook, not trusted from the call site
- The inner layer is oversized by exactly its travel distance, so a frame can
  never reveal an uncovered edge
- Scale stays within 1.00–1.06
- No React state is written during scrolling; the scroll-direction and gallery
  hooks are rAF-throttled and only `setState` when a value actually changes

## Reduced motion

`prefers-reduced-motion: reduce` is honoured in **both** layers, so neither alone
can leave something running:

- **JS** — no GSAP context, no ScrollTrigger and no `<video>` element is created
  at all. Clips are not paused; they are never mounted.
- **CSS** — animations and transitions collapse to ~0ms, parallax transforms are
  forced to `none`, and the scroll-behaviour is reset.

All content stays present and readable, and the gallery keeps working via its
buttons, arrow keys and swipe.

---

## Booking flow

A demonstration only. `onSubmit` calls `preventDefault()`, validates locally via
`src/lib/booking.ts`, and swaps the form for a notice stating that no reservation
has been submitted. **No network request is made, and nothing is stored.** The
Playwright suite asserts that no `POST`/`PUT`/`PATCH` leaves the page and the unit
suite asserts that `fetch`, `sendBeacon` and `XMLHttpRequest` are never touched.

Rates are always rendered beside an explicit *concept pricing* label.

---

## Replacing the placeholder media

Every image and clip in `/public/nara-house` is generated. To use real
photography, **drop files with the same names and aspect ratios over the top** —
no code changes are required. `src/content/assets.ts` is the single manifest if
you would rather point at different filenames.

See **[docs/ASSETS.md](docs/ASSETS.md)** for the required crop, resolution,
duration, codec and art direction of every asset, and
**[docs/PERFORMANCE.md](docs/PERFORMANCE.md)** for the performance checklist.

### Known limitation: MP4 fallbacks

The generated clips ship as **VP8/WebM only** — the environment used to build
this project has no H.264 encoder. Browsers without WebM support (notably iOS
Safari before 17.4) therefore show the poster still, which is the designed
fallback rather than a failure.

To add full coverage:

1. Encode H.264 `.mp4` siblings next to each `.webm` in
   `/public/nara-house/video` (same base names).
2. Set `MP4_FALLBACKS_AVAILABLE = true` in `src/lib/media.ts`.

That single flag adds an `<source type="video/mp4">` after each WebM entry.

---

## Testing

- **Unit (Vitest + Testing Library)** — room data mapping and detail content,
  article structure and reading times, related-entry selection, asset source
  selection, video visibility behaviour, reduced-motion behaviour, navigation
  mapping, booking validation, date validation, concept submission.
- **End-to-end (Playwright)** — run against `desktop-chromium` (1440×900) and
  `mobile-chromium` (412×915): hero and wordmark, poster fallback, scroll
  reveals, keyboard-operable gallery, no horizontal overflow, reduced motion
  without autoplay, keyboard-operable booking modal, no real submission,
  off-screen clips paused, navigation anchors, the footer disclaimer, and the
  long-form journal and room pages (structure, reading measure, related reading,
  structured data, and the absence of lodging markup).

```bash
npm run build && npm run test:e2e
```

> The Playwright config points at the system Chromium at `/opt/pw-browsers/chromium`
> when it exists, and declares the phone profile explicitly rather than using
> `devices["Pixel 7"]`. Both work around a browser-build mismatch in the
> container; on a normal machine, delete neither — they degrade gracefully.

---

## Accessibility

Semantic landmarks and a correct heading outline, a skip link, visible focus on
every interactive element, a keyboard-operable horizontal gallery (arrow keys,
Home/End, focusable scroll region), a focus-trapped modal that restores focus on
close, a reference-counted body scroll lock, meaningful alt text with decorative
images marked empty, and text alternatives for atmospheric clips.

Nothing on any viewport depends on hover: the desktop hover previews in *The
Surroundings* and *Notes from the House* are enhancements, and the same
information is rendered inline on narrow screens.

**This is verified, not claimed.** `e2e/accessibility.spec.ts` runs axe-core
against WCAG 2.0/2.1 A and AA on every page type, on the booking panel in both
its states, on the mobile menu and on the room gallery — zero violations on both
viewports. Because axe cannot see through a photograph and silently assumes a
white background, the hero's contrast is instead measured from rendered pixels.
See [docs/PERFORMANCE.md](docs/PERFORMANCE.md#accessibility) for what the audit
found and changed.

## Performance

Measured rather than estimated: **LCP 108–216 ms and CLS exactly 0.0000** across
all four page types on both viewports, with the home page at 284 KB (181 KB of
which is the hero clip) and every other route around 100 KB.

```bash
npm run build && npm run start &
npm run measure:performance
```

These are localhost figures from a real Chromium, not a Lighthouse score — a
regression guard rather than a field measurement. Numbers and caveats in
[docs/PERFORMANCE.md](docs/PERFORMANCE.md).

---

## Credits

A concept project by Jedsada Creative Technology Studio. NARA HOUSE is a
fictional hospitality brand created for portfolio demonstration.

## Licence

Proprietary — all rights reserved. See **[LICENSE](LICENSE)**. The source is
public to be read and evaluated, not to be reused; no licence to copy, modify or
redistribute is granted.
