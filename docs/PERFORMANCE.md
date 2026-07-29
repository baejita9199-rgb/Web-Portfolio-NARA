# Performance

## Measured results

These are recorded, not asserted. Reproduce them with:

```bash
npm run build
npm run start &
npm run measure:performance
```

`scripts/measure-performance.mjs` drives a real Chromium, reads LCP and CLS from
the same `PerformanceObserver` entries field tooling uses, and reports what was
actually requested on first load. It exits non-zero if anything is over budget.

Run on 2026-07-29 against the production build, on a warm local server:

| Route | Viewport | LCP | CLS | Requests | Declared weight |
| --- | --- | ---: | ---: | ---: | ---: |
| `/` | 1440×900 | 216 ms | 0.0000 | 25 | 284 KB |
| `/journal` | 1440×900 | 112 ms | 0.0000 | 34 | 106 KB |
| `/journal/[slug]` | 1440×900 | 144 ms | 0.0000 | 30 | 103 KB |
| `/rooms/[slug]` | 1440×900 | 108 ms | 0.0000 | 25 | 103 KB |
| `/` | 412×915 | 172 ms | 0.0000 | 27 | 284 KB |
| `/journal` | 412×915 | 116 ms | 0.0000 | 33 | 102 KB |
| `/journal/[slug]` | 412×915 | 160 ms | 0.0000 | 30 | 100 KB |
| `/rooms/[slug]` | 412×915 | 120 ms | 0.0000 | 26 | 101 KB |

Budgets: **LCP ≤ 2500 ms**, **CLS ≤ 0.1**. Every route is comfortably inside
both, and **CLS is exactly zero on every route and both viewports** — every
media frame reserves its space before the file arrives.

Of the home page's 284 KB, 181 KB is the hero clip and 99 KB is the two font
families. Every other route is essentially fonts plus a few KB of markup, with
imagery streaming in lazily below the fold.

### What this is not

This is **not a Lighthouse score**. It does not model a slow CPU, a cold cache,
a throttled network or a real-world TTFB, and it was run against localhost.
Treat these as a floor and a regression guard, not as a field measurement. Run
Lighthouse against a real deployment before quoting a score anywhere.

---

## Checklist

### Media loading

- [x] Only the hero clip loads eagerly. Measured: `/` requests exactly one video
      file and every other route requests none.
- [x] **The viewport gets the crop it should.** Source lists are written after
      hydration, never during server rendering — a `<source>` in the server HTML
      is chosen before the viewport is known, and the browser begins fetching it
      before React can correct it. This was a real bug: phones were downloading
      the 181 KB landscape hero and never the portrait one. Locked in by an e2e
      test that fails if the wrong crop is even *requested*.
- [x] **The hero poster is art-directed by the browser, not by React.** The same
      defect the entry above describes for `<source>` outlived that fix in the
      poster, which chose its crop from `useMediaQuery` — false during server
      rendering, so the phone fetched the 16:9 still from the delivered HTML and
      the 3:4 one after hydration, downloading both and shifting its own LCP
      element. `AmbientVideo` now emits a `<picture>` built from
      `getImageProps`, so the crop is resolved from the markup, before
      hydration, exactly once. Covered by the same e2e test as the clips.
- [x] Every other clip has `preload="none"` and no `<source>` in the DOM until
      it approaches the viewport
- [x] Clips pause when scrolled out of view and when the tab is hidden
- [x] Only one clip can play at a time — asserted while scrolling the whole page
- [x] Sources stay attached once loaded, so scrolling back does not re-download
- [x] Generated clips are 100–200 KB each; total video weight ≈ 0.8 MB
- [x] Total image weight ≈ 0.59 MB across 44 stills

### Images

- [x] `next/image` everywhere, AVIF/WebP negotiated
- [x] Every frame declares an aspect ratio — **measured CLS is 0.0000**
- [x] `sizes` declared per call site from the `imageSizes` map
- [x] `priority` limited to the hero poster and the lead image of an article or
      room page; everything else is lazy
- [x] Meaningful `alt` on informative images, empty `alt` on decorative ones

### Runtime

- [x] One animation library (GSAP + ScrollTrigger). No second motion runtime, no
      smooth-scroll wrapper, no Three.js, no canvas.
- [x] Only `transform` and `opacity` are animated — never layout properties
- [x] Every timeline lives in a `gsap.context()` and is reverted on unmount
- [x] Every observer and listener is disconnected on unmount
- [x] No React state is written per scroll frame. `useScrollDirection`,
      `useViewportSize` and the gallery's index measurement are rAF-throttled and
      only `setState` when a value actually changes.
- [x] Scroll and resize listeners are passive
- [x] Film grain is a static 256px tile baked into the images, not a runtime filter
- [x] No `backdrop-filter`, no large `blur()`, no heavy shadows

### Build

- [x] All 17 routes are statically prerendered
- [x] Fonts self-hosted through `next/font/google` — no render-blocking
      stylesheet, no layout shift from a late swap
- [x] No remote image hosts configured; no third-party runtime dependency
- [x] Long-lived immutable caching on `/nara-house/video/*`

---

## Accessibility

Verified rather than claimed. `e2e/accessibility.spec.ts` runs **axe-core**
against WCAG 2.0/2.1 A and AA on every page type, plus the booking panel (open
and in its error state), the mobile menu and the room gallery.

Two things it handles that a naive axe run gets wrong:

1. **Text over footage.** axe walks up the DOM for an opaque background, finds
   none behind the hero, and assumes white — reporting both false failures and
   false passes. The hero is scanned for every rule *except* colour, and its real
   contrast is measured from rendered pixels: the copy is hidden, the region is
   screenshotted, the 95th-percentile background luminance is computed, and the
   text colour is composited over the true mean before the ratio is taken.
2. **Semi-transparent text.** Ignoring the alpha channel flatters every reading,
   so the measurement composites it first.

Both viewports pass with zero violations.

### What the audit changed

The audit found one real class of defect: the small uppercase labels that are a
signature of this design run at 12px, where WCAG asks for 4.5:1, and the brand
clay measured **3.84:1** on rice paper while the muted grey measured **2.84:1**.

- `--clay-ink` (`#73604f`, 5.10:1) was introduced for small text; `--clay-brown`
  remains the brand colour for rules, borders and large elements.
- `--text-muted` went from 0.48 to 0.66 alpha (2.84:1 → 4.62:1).
- `--text-inverse-muted` and a new `--text-inverse-faint` were set to values that
  clear 4.5:1 on *both* forest green and charcoal.
- The hero's bottom furniture measured 2.5:1 over a pale frame and now sits on a
  dedicated gradient band; below 48rem the hero's second scrim becomes
  bottom-weighted, because a wash from the left edge does nothing for copy that
  spans the full width of a phone.

Remaining limits: axe covers roughly a third of real accessibility problems. The
keyboard, focus-trap, scroll-lock and screen-reader behaviours are asserted
directly in the other specs, but nothing here substitutes for testing with an
actual screen reader.
