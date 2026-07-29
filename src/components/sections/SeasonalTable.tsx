import { AmbientVideo } from "@/components/media/AmbientVideo";
import { EditorialImage } from "@/components/media/EditorialImage";
import { ImageReveal, Reveal } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { assetDimensions, naraAssets } from "@/content/assets";
import { seasonalMenu } from "@/content/day";
import { imageSizes } from "@/lib/media";
import styles from "./SeasonalTable.module.css";

/**
 * Section 06 — Seasonal Table.
 *
 * The deep-green surface of the page. One short clip of steam sits beside two
 * stills; the video is well below the fold and therefore never downloads until
 * the section is nearly on screen.
 */
export function SeasonalTable() {
  return (
    <section
      id="table"
      className={styles.section}
      aria-labelledby="table-title"
      data-surface="dark"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <SectionLabel number="06" label="Seasonal Table" tone="dark" />
          <Reveal>
            <h2 id="table-title" className={styles.title}>
              A seasonal table.
            </h2>
          </Reveal>
          <Reveal>
            <p className={styles.lede}>
              Meals are guided by what is growing nearby, prepared simply and
              served without hurry.
            </p>
          </Reveal>
        </header>

        <div className={styles.body}>
          <div className={styles.mediaColumn}>
            <ImageReveal>
              <div className={styles.videoFrame}>
                <AmbientVideo
                  desktopSrc={naraAssets.video.seasonalTable}
                  desktopFallbackSrc={naraAssets.video.seasonalTableFallback}
                  poster={naraAssets.posters.seasonalTable}
                  alt="Steam rising from a bowl set on a worn timber table."
                  description="Steam rising slowly from a freshly poured bowl on a timber table."
                  sizes={imageSizes.half}
                />
              </div>
            </ImageReveal>

            <ImageReveal className={styles.detailPlate}>
              <EditorialImage
                image={{
                  src: naraAssets.images.seasonalIngredients,
                  ...assetDimensions.square,
                  alt: "Vegetables and herbs from the garden, laid out before cooking.",
                }}
                ratio="1 / 1"
                sizes={imageSizes.narrow}
                plate="Fig. 06"
                caption="Whatever the garden gave up that morning."
              />
            </ImageReveal>
          </div>

          <div className={styles.menuColumn}>
            <Reveal>
              <p className={styles.menuIntro}>
                There is no fixed menu. What follows is a typical day, written
                down after the fact.
              </p>
            </Reveal>

            <Reveal splitChildren as="dl" className={styles.menu}>
              {seasonalMenu.map((entry) => (
                <div key={entry.time} className={styles.menuRow}>
                  <dt className={styles.menuTime}>{entry.time}</dt>
                  <dd className={styles.menuDish}>{entry.dish}</dd>
                </div>
              ))}
            </Reveal>

            <ImageReveal className={styles.tablePlate}>
              <EditorialImage
                image={{
                  src: naraAssets.images.seasonalTable,
                  ...assetDimensions.detail,
                  alt: "Hands setting a shared dish onto a long timber table.",
                }}
                ratio="4 / 3"
                sizes={imageSizes.half}
              />
            </ImageReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
