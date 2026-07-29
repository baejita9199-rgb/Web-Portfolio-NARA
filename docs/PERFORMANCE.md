# Performance checklist

Targets: Lighthouse Performance ≥ 90 desktop / ≥ 75 mobile, LCP < 2.5 s,
CLS < 0.1, INP in the good range.

## Media loading

- [x] Only the hero clip loads eagerly (`priority`, `preload="metadata"`)
- [x] Every other clip has `preload="none"` and **no `<source>` in the DOM**
      until it approaches the viewport, so nothing below the fold is fetched on
      load. Verified by an e2e assertion, not by inspection.
- [x] Clips pause when scrolled out of view and when the tab is hidden
- [x] Only one clip can be playing at a time — the others are off screen and
      therefore paused. Asserted end-to-end while scrolling the whole page.
- [x] Sources stay attached once loaded, so scrolling back does not re-download
- [x] Generated clips are 100–200 KB each; total video weight ≈ 0.8 MB
- [x] Total image weight ≈ 0.4 MB across 31 stills

## Images

- [x] `next/image` everywhere, AVIF/WebP negotiated
- [x] Every frame declares an aspect ratio, so space is reserved before decode
      and CLS from media is zero
- [x] `sizes` declared per call site from the `imageSizes` map — no 1920px file
      downloaded for a 480px column
- [x] `priority` limited to the hero poster and the lead image of a journal or
      room page
- [x] Everything else is lazy
- [x] Meaningful `alt` on informative images, empty `alt` on decorative ones

## Runtime

- [x] One animation library (GSAP + ScrollTrigger). No second motion runtime,
      no smooth-scroll wrapper, no Three.js, no canvas.
- [x] Only `transform` and `opacity` are animated — never layout properties
- [x] Every timeline lives in a `gsap.context()` and is reverted on unmount
- [x] Every observer and listener is disconnected on unmount; an e2e assertion
      covers the observer case
- [x] No React state is written per scroll frame. `useScrollDirection`,
      `useViewportSize` and the gallery's index measurement are rAF-throttled
      and only `setState` when a value actually changes.
- [x] Scroll and resize listeners are passive
- [x] Film grain is a static 256px tile baked into the images, not a runtime
      filter
- [x] No `backdrop-filter`, no large `blur()`, no heavy shadows

## Build

- [x] All 13 routes are statically prerendered
- [x] Fonts self-hosted through `next/font/google` — no render-blocking
      stylesheet, no layout shift from a late swap
- [x] No remote image hosts configured; the site has no third-party runtime
      dependency
- [x] Long-lived immutable caching on `/nara-house/video/*`

## Verification

```bash
npm run verify                        # lint + typecheck + unit + build
npm run build && npm run test:e2e     # 82 end-to-end assertions, 2 viewports
```

Manual pass:

1. DevTools console clean on load and through a full scroll — no errors, no
   hydration warnings.
2. Network panel: only `hero-desktop.webm` is requested on first load. Scroll to
   *A Day at NARA* and confirm `morning-curtain.webm` is requested only then.
3. Emulate `prefers-reduced-motion: reduce`: no `<video>` elements exist, no
   transforms are applied, and no content is missing.
4. Throttle to Slow 4G and confirm posters carry the composition while clips
   arrive.

## What has not been measured

Lighthouse has not been run against a deployed instance — this build has only
been exercised locally and in headless Chromium, and the figures at the top of
this document are targets rather than recorded results. Run it against a real
deployment before quoting any number.
