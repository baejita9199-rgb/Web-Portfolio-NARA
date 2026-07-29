import Image from "next/image";
import { AmbientVideo } from "@/components/media/AmbientVideo";
import { ParallaxMedia } from "@/components/media/ParallaxMedia";
import { ImageReveal, Reveal } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { dayChapters } from "@/content/day";
import { imageSizes } from "@/lib/media";
import styles from "./DayTimeline.module.css";

/** Alternating drift speeds keep consecutive chapters from moving in lockstep. */
const chapterSpeeds = [0.06, -0.05, 0.09, -0.04];

/**
 * Section 05 — A Day at NARA.
 *
 * A vertical editorial timeline. On desktop the hour holds itself in place
 * beside the passage it belongs to using `position: sticky` — no scroll
 * listener, no pinning library, and it degrades to ordinary flow on mobile.
 */
export function DayTimeline() {
  return (
    <section
      id="experience"
      className={styles.section}
      aria-labelledby="experience-title"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <SectionLabel number="05" label="A Day at NARA" />
          <Reveal>
            <h2 id="experience-title" className={styles.title}>
              One day, from first light to the dark beneath the trees.
            </h2>
          </Reveal>
        </header>

        <ol className={styles.timeline} role="list">
          {dayChapters.map((chapter, index) => (
            <li key={chapter.time} className={styles.chapter}>
              <div className={styles.timeColumn}>
                <p className={styles.time}>
                  <span className={styles.timeIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.timeLabel}>{chapter.time}</span>
                </p>
              </div>

              <div className={styles.contentColumn}>
                <Reveal>
                  <h3 className={styles.chapterTitle}>{chapter.title}</h3>
                </Reveal>

                <Reveal splitChildren className={styles.lines}>
                  {chapter.lines.map((line) => (
                    <p key={line} className={styles.line}>
                      {line}
                    </p>
                  ))}
                </Reveal>

                <ImageReveal className={styles.media}>
                  <ParallaxMedia
                    speed={chapterSpeeds[index] ?? 0.06}
                    ratio={index % 2 === 0 ? "4 / 3" : "3 / 4"}
                    disabledOnMobile
                  >
                    {chapter.media.kind === "video" ? (
                      // The only clip in this section. Everything else is still,
                      // so no two videos are ever adjacent on the page.
                      <AmbientVideo
                        desktopSrc={chapter.media.video.desktopSrc}
                        desktopFallbackSrc={
                          chapter.media.video.desktopFallbackSrc
                        }
                        poster={chapter.media.poster.src}
                        alt={chapter.media.poster.alt}
                        description={chapter.media.video.description}
                        sizes={imageSizes.column}
                      />
                    ) : (
                      <Image
                        src={chapter.media.image.src}
                        alt={chapter.media.image.alt}
                        fill
                        sizes={imageSizes.column}
                        className={styles.image}
                      />
                    )}
                  </ParallaxMedia>
                </ImageReveal>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
