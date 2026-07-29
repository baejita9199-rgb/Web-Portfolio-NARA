"use client";

import Image from "next/image";
import { useState } from "react";
import { ParallaxMedia } from "@/components/media/ParallaxMedia";
import { ImageReveal, Reveal } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { naraAssets } from "@/content/assets";
import { materials } from "@/content/experiences";
import { imageSizes } from "@/lib/media";
import styles from "./ArchitectureStory.module.css";

/**
 * Four plates of deliberately different proportion — panoramic, square,
 * portrait, square again at a different scale. Matching ratios are the fastest
 * way to make a page look like a template, so no two sit at the same size.
 */
const plates = [
  {
    materialIndex: "01",
    src: naraAssets.images.materialTimber,
    alt: "The long elevation of the house, timber screens running the length of the terrace.",
    ratio: "16 / 9",
    speed: 0.05,
    sizes: imageSizes.full,
  },
  {
    materialIndex: "02",
    src: naraAssets.images.materialClay,
    alt: "A close view of hand-floated lime plaster, its texture raking in low light.",
    ratio: "1 / 1",
    speed: 0.11,
    sizes: imageSizes.half,
  },
  {
    materialIndex: "03",
    src: naraAssets.images.materialStone,
    alt: "A deep window opening cut through a stone wall, light falling on the sill.",
    ratio: "3 / 4",
    speed: -0.07,
    sizes: imageSizes.half,
  },
  {
    materialIndex: "04",
    src: naraAssets.images.materialTextile,
    alt: "The warp and weft of an undyed woven cloth, close up.",
    ratio: "1 / 1",
    speed: 0.08,
    sizes: imageSizes.third,
  },
] as const;

/**
 * Section 03 — Built with the Land.
 *
 * Pointing at a plate highlights the material it is made of. The link works in
 * both directions and, critically, the material list is fully legible without
 * ever hovering anything — the interaction adds emphasis, never information.
 */
export function ArchitectureStory() {
  const [activeMaterial, setActiveMaterial] = useState<string | null>(null);

  return (
    <section
      id="materials"
      className={styles.section}
      aria-labelledby="materials-title"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <SectionLabel number="03" label="Built with the Land" />
          <Reveal>
            <h2 id="materials-title" className={styles.title}>
              Built with the land, not placed upon it.
            </h2>
          </Reveal>
          <Reveal>
            <p className={styles.lede}>
              Local timber, lime plaster, handmade clay and stone collected from
              the surrounding terrain form the quiet material language of the
              house.
            </p>
          </Reveal>
        </header>

        <div className={styles.plates}>
          {plates.map((plate, index) => {
            const material = materials.find(
              (entry) => entry.index === plate.materialIndex,
            );
            const isActive = activeMaterial === plate.materialIndex;

            return (
              <figure
                key={plate.src}
                className={styles.plate}
                data-plate={index + 1}
                data-active={isActive ? "true" : "false"}
                onMouseEnter={() => setActiveMaterial(plate.materialIndex)}
                onMouseLeave={() => setActiveMaterial(null)}
              >
                <ImageReveal>
                  <ParallaxMedia
                    speed={plate.speed}
                    ratio={plate.ratio}
                    disabledOnMobile
                  >
                    <Image
                      src={plate.src}
                      alt={plate.alt}
                      fill
                      sizes={plate.sizes}
                      className={styles.image}
                    />
                  </ParallaxMedia>
                </ImageReveal>

                {/* Present on every viewport. On desktop it also fades up as the
                    plate is pointed at, which is the whole of the hover effect —
                    no zoom, no lift, no shadow. */}
                <figcaption className={styles.plateCaption}>
                  <span className={styles.plateIndex}>{plate.materialIndex}</span>
                  <span className={styles.plateLabel}>{material?.label}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>

        <Reveal splitChildren as="ol" className={styles.materials}>
          {materials.map((material) => (
            <li
              key={material.index}
              className={styles.material}
              data-active={activeMaterial === material.index ? "true" : "false"}
            >
              <span className={styles.materialIndex}>{material.index}</span>
              <span className={styles.materialBody}>
                <span className={styles.materialLabel}>{material.label}</span>
                <span className={styles.materialNote}>{material.note}</span>
              </span>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
