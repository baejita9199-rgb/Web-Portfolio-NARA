"use client";

import Image from "next/image";
import { useState } from "react";
import { FullBleedMedia } from "@/components/media/FullBleedMedia";
import { ParallaxMedia } from "@/components/media/ParallaxMedia";
import { Reveal } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { naraAssets } from "@/content/assets";
import { experiences } from "@/content/experiences";
import { imageSizes } from "@/lib/media";
import styles from "./SurroundingsSection.module.css";

const overlayLines = [
  "Forest paths.",
  "Small villages.",
  "Morning markets.",
  "Mountain air.",
];

/**
 * Section 07 — The Surroundings.
 *
 * An editorial list, not a card grid. On desktop, moving through the rows
 * changes a single large preview beside them; on mobile each row simply carries
 * its own photograph, so nothing depends on a hover that will never happen.
 */
export function SurroundingsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      id="surroundings"
      className={styles.section}
      aria-labelledby="surroundings-title"
    >
      <FullBleedMedia
        height="tall"
        overlay="medium"
        scrimFocus="corner"
        align="end"
        media={
          <ParallaxMedia speed={0.07} scaleFrom={1} scaleTo={1.04}>
            <Image
              src={naraAssets.images.surroundings}
              alt="Layered ridgelines fading into morning haze beyond the valley."
              fill
              sizes={imageSizes.full}
              className={styles.bleedImage}
            />
          </ParallaxMedia>
        }
      >
        <div className={styles.overlay}>
          <SectionLabel number="07" label="The Surroundings" tone="dark" />
          <Reveal>
            <h2 id="surroundings-title" className={styles.overlayTitle}>
              Beyond the house.
            </h2>
          </Reveal>
          <Reveal splitChildren className={styles.overlayLines}>
            {overlayLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </Reveal>
        </div>
      </FullBleedMedia>

      <div className={styles.inner}>
        <div className={styles.listLayout}>
          <ul className={styles.list} role="list">
            {experiences.map((experience, index) => (
              <li
                key={experience.title}
                className={styles.row}
                data-active={index === activeIndex ? "true" : "false"}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
              >
                <p className={styles.rowIndex}>
                  {String(index + 1).padStart(2, "0")}
                </p>

                <div className={styles.rowBody}>
                  <h3 className={styles.rowTitle}>{experience.title}</h3>
                  <p className={styles.rowDescription}>
                    {experience.description}
                  </p>
                </div>

                <p className={styles.rowSeason}>{experience.season}</p>

                {/* Shown on narrow viewports, where the shared preview panel
                    is not rendered at all. */}
                <div className={styles.rowImage}>
                  <Image
                    src={experience.image.src}
                    alt={experience.image.alt}
                    fill
                    sizes={imageSizes.half}
                    className={styles.image}
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className={styles.preview} aria-hidden="true">
            <div className={styles.previewFrame}>
              {experiences.map((experience, index) => (
                <Image
                  key={experience.image.src}
                  src={experience.image.src}
                  alt=""
                  fill
                  sizes={imageSizes.narrow}
                  className={styles.previewImage}
                  data-active={index === activeIndex ? "true" : "false"}
                />
              ))}
            </div>
            <p className={styles.previewCaption}>
              {experiences[activeIndex]?.title}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
