import Image from "next/image";
import { EditorialImage } from "@/components/media/EditorialImage";
import { ParallaxMedia } from "@/components/media/ParallaxMedia";
import { SplitMediaText } from "@/components/media/SplitMediaText";
import { ImageReveal, Reveal } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { assetDimensions, naraAssets } from "@/content/assets";
import { site } from "@/content/site";
import { imageSizes } from "@/lib/media";
import styles from "./EditorialIntro.module.css";

const openingLines = [
  "The trees.",
  "The slope.",
  "The morning light.",
  "The silence between rooms.",
];

/**
 * Section 02 — The House.
 *
 * The first surface change of the page: video gives way to paper. The two
 * columns move at slightly different speeds so the spread breathes without
 * anything leaving its place in the document flow.
 */
export function EditorialIntro() {
  return (
    <section
      id="the-house"
      className={styles.section}
      aria-labelledby="the-house-title"
    >
      <div className={styles.inner}>
        <SplitMediaText
          mediaSide="right"
          balance="text-lead"
          media={
            <div className={styles.mediaColumn}>
              <ImageReveal>
                <ParallaxMedia speed={0.09} ratio="3 / 4" disabledOnMobile>
                  <Image
                    src={naraAssets.images.architecturePortrait}
                    alt="The house seen from the garden, timber screens filtering the afternoon light."
                    fill
                    sizes={imageSizes.column}
                    className={styles.image}
                  />
                </ParallaxMedia>
              </ImageReveal>

              {/* The caption drifts at a different rate to the plate above it —
                  the smallest possible amount of parallax that still reads. */}
              <ParallaxMedia
                speed={-0.04}
                className={styles.captionParallax}
                disabledOnMobile
              >
                <figure className={styles.caption}>
                  <figcaption>
                    <span className={styles.captionBrand}>{site.name}</span>
                    <span>{site.location.label}</span>
                    <span>{site.location.detail}</span>
                  </figcaption>
                </figure>
              </ParallaxMedia>
            </div>
          }
        >
          <div className={styles.textColumn}>
            <SectionLabel number="02" label="The House" />

            <Reveal>
              <h2 id="the-house-title" className={styles.title}>
                The house was designed around what already existed.
              </h2>
            </Reveal>

            <Reveal splitChildren className={styles.lines}>
              {openingLines.map((line) => (
                <p key={line} className={styles.line}>
                  {line}
                </p>
              ))}
            </Reveal>

            <Reveal splitChildren className={styles.body}>
              <p>
                Nothing was cleared that did not have to be. The plan bends
                around two mango trees that were already here, and the floor
                steps down with the slope rather than cutting into it.
              </p>
              <p>
                What remains is a small building of five rooms, oriented east,
                built to be quiet at every hour of the day.
              </p>
            </Reveal>

            <Reveal className={styles.plate}>
              <EditorialImage
                image={{
                  src: naraAssets.images.architectureWide,
                  ...assetDimensions.panoramic,
                  alt: "A long view of the house sitting low against the treeline.",
                }}
                ratio="12 / 5"
                sizes={imageSizes.column}
                plate="Fig. 01"
                caption="The approach, seen from the lower garden in the last hour of light."
              />
            </Reveal>
          </div>
        </SplitMediaText>
      </div>
    </section>
  );
}
