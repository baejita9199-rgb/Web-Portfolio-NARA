# Asset requirements

Everything in `/public/nara-house` is a generated placeholder. This document is
the brief for replacing it with real photography and footage.

**Replacing an asset is a file swap.** Keep the filename and the aspect ratio and
nothing in the code needs to change. `src/content/assets.ts` is the manifest if
you would rather point at different names; `src/content/*.ts` holds the alt text.

---

## Art direction

These rules apply to every frame. They are what make a set of separate images
read as one shoot.

**Camera**
- 35mm and 50mm primes as the backbone
- Wide angle used sparingly; never so wide that a room distorts
- Camera at eye level, held straight — no dutch angles, no floor-level drama
- Compose with generous negative space; let the subject sit off-centre
- Frame *through* things: door openings, window reveals, timber screens, shadow

**Light**
- Natural light only. Morning and late afternoon are the register.
- Soft overcast is welcome; hard midday sun is not
- No flash, no HDR look, no blown-out windows
- Let shadow stay genuinely dark — do not lift it in post

**Grade**
- Warm neutral base, muted greens, earth tones
- Low saturation, soft contrast, slight filmic grain
- Nothing cool or blue; nothing that reads as digital-clean

**People**
- Secondary to the space, never the subject
- No clearly legible faces
- Hands, a shoulder, a back, a figure mid-movement
- It must not look like stock photography

**Do not use** imagery of real hotels or identifiable businesses, watermarked
stock, or anything you do not hold the rights to. The brand is fictional and the
imagery must not imply otherwise.

---

## Still images

All stills are `.webp`, quality ~80, in `/public/nara-house/images/`.

Aspect ratios are intentionally mixed — a page where every image is the same
shape is the fastest way to look like a template. **Match the ratio when you swap
a file.**

| File | Size | Ratio | Subject |
| --- | --- | --- | --- |
| `hero-poster-desktop.webp` | 1920×1080 | 16:9 | First frame of the hero clip — mist through ridgelines |
| `hero-poster-mobile.webp` | 1080×1440 | 3:4 | Portrait crop of the same moment |
| `architecture-wide.webp` | 2400×1000 | 12:5 | Panoramic: the house low against the treeline |
| `architecture-portrait.webp` | 1200×1600 | 3:4 | The house from the garden, through timber screens |
| `material-timber.webp` | 1920×1080 | 16:9 | The long elevation, timber screens along the terrace |
| `material-clay.webp` | 1200×1200 | 1:1 | Detail: hand-floated lime plaster in raking light |
| `material-stone.webp` | 1200×1600 | 3:4 | A deep opening cut through stone, light on the sill |
| `forest-room-01.webp` | 1280×1600 | 4:5 | Forest Room — bed, garden beyond, morning light |
| `forest-room-02.webp` | 1400×1050 | 4:3 | Forest Room detail — linen, low window |
| `courtyard-suite-01.webp` | 1280×1600 | 4:5 | Courtyard Suite — pale stone, open to the sky |
| `courtyard-suite-02.webp` | 1400×1050 | 4:3 | Afternoon shadow across a stone courtyard floor |
| `hill-residence-01.webp` | 1280×1600 | 4:5 | Hill Residence — terrace over layered ridgelines at dusk |
| `hill-residence-02.webp` | 1400×1050 | 4:3 | Low table and two chairs on a covered terrace |
| `breakfast.webp` | 1400×1050 | 4:3 | A shared table laid simply, warm light |
| `seasonal-table.webp` | 1400×1050 | 4:3 | Hands setting a dish onto a long timber table |
| `seasonal-ingredients.webp` | 1200×1200 | 1:1 | Garden vegetables and herbs before cooking |
| `tea-tasting.webp` | 1400×1050 | 4:3 | Tea poured into a small unglazed cup |
| `craft-visit.webp` | 1400×1050 | 4:3 | Hands turning clay on a low workshop table |
| `forest-path.webp` | 1200×1600 | 3:4 | A narrow footpath into tall forest |
| `garden-session.webp` | 1400×1050 | 4:3 | A hand gathering herbs from a raised bed |
| `reading-picnic.webp` | 1400×1050 | 4:3 | Blanket and open book in dappled shade |
| `bicycle-route.webp` | 1400×1050 | 4:3 | Empty rural road curving between fields at first light |
| `evening-room.webp` | 1920×1080 | 16:9 | A room at night, one low lamp, dark garden beyond |
| `surroundings.webp` | 1920×1080 | 16:9 | Layered ridgelines fading into morning haze |
| `journal-01.webp` | 1400×1050 | 4:3 | Late light raking across plaster |
| `journal-02.webp` | 1920×1080 | 16:9 | Low cloud moving through a forested valley after rain |
| `journal-03.webp` | 1280×1600 | 4:5 | Breakfast setting on a worn timber table |
| `poster-morning-curtain.webp` | 1400×1050 | 4:3 | Poster for the morning-curtain clip |
| `poster-seasonal-table.webp` | 1080×1350 | 4:5 | Poster for the seasonal-table clip |
| `poster-evening-light.webp` | 1920×1080 | 16:9 | Poster for the evening-light clip |
| `og-nara-house.webp` | 1200×630 | 1.91:1 | Open Graph card |

**A poster must be a frame from its own clip.** If it is not, the crossfade from
still to motion visibly jumps.

### Sizing guidance

Do not supply files much larger than the table above. `next/image` generates the
responsive set; oversized originals only slow the build and inflate the repo.

---

## Ambient clips

All clips live in `/public/nara-house/video/`.

| File | Size | Duration | Subject |
| --- | --- | --- | --- |
| `hero-desktop.webm` | 1600×900 | 6 s | Mist moving slowly through the ridgelines |
| `hero-mobile.webm` | 1080×1440 | 6 s | Portrait crop of the same |
| `morning-curtain.webm` | 1280×960 | 5 s | Early light across a linen curtain as it breathes |
| `seasonal-table.webm` | 1080×1350 | 5 s | Steam rising slowly from a bowl |
| `evening-light.webm` | 1600×900 | 6 s | Lamplight settling as the last daylight goes |

### Requirements

- **5–8 seconds.** Longer clips are not atmosphere, they are a film.
- **Seamlessly looping.** The last frame must hand back to the first with no cut.
- **Slow motion within the frame.** Drifting mist, a curtain, steam, a shadow
  crossing a wall. No camera moves faster than a slow drift, no cuts.
- **No audio track at all.** Not silent audio — no track.
- **Target under ~400 KB each.** The generated placeholders sit at 100–200 KB.

### Encoding

```bash
# VP9 WebM (preferred)
ffmpeg -i source.mov -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 \
  -pix_fmt yuv420p -an -auto-alt-ref 0 hero-desktop.webm

# H.264 MP4 fallback — see "MP4 fallbacks" below
ffmpeg -i source.mov -c:v libx264 -crf 25 -preset slow -profile:v main \
  -pix_fmt yuv420p -movflags +faststart -an hero-desktop.mp4
```

`-auto-alt-ref 0` matters: alt-ref frames can produce a visible hitch exactly at
the loop point.

### MP4 fallbacks

The committed clips are **WebM only**, because the environment this project was
built in has no H.264 encoder. Browsers without WebM support (iOS Safari before
17.4) show the poster still instead — the designed fallback.

To enable full coverage:

1. Add `.mp4` siblings for each clip, with the same base names.
2. Set `MP4_FALLBACKS_AVAILABLE = true` in `src/lib/media.ts`.

---

## Regenerating the placeholders

```bash
npm run generate:media                 # everything
npm run generate:media -- --images-only
npm run generate:media -- --videos-only
```

Output is deterministic — the same recipes always produce byte-identical files.

The art direction lives in `scripts/lib/recipes.mjs` as declarative light
conditions (`morningValley`, `interior`, `courtyard`, `forest`, `dusk`, `table`,
`surface`) composed from layer primitives in `scripts/lib/compositor.mjs`
(`linear`, `radial`, `band`, `shaft`, `mass`, `rect`, `grain`, `vignette`).
Adding a placeholder means adding one entry to `imageRecipes` or `videoRecipes`.

Video encoding uses ffmpeg. The script looks for `$FFMPEG_PATH`, then
Playwright's bundled binary, then a system install. Without one it skips the
clips and says so — the site still renders, because every clip falls back to its
poster.
