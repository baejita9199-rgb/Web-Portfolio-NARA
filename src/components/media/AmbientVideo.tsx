"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { breakpoints, useMediaQuery } from "@/hooks/useMediaQuery";
import { useIntersectionVideo } from "@/hooks/useIntersectionVideo";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  resolvePoster,
  resolvePreload,
  resolveVideoSources,
} from "@/lib/media";
import styles from "./AmbientVideo.module.css";

export type AmbientVideoProps = {
  desktopSrc: string;
  /** Portrait crop for narrow viewports. Falls back to the desktop file. */
  mobileSrc?: string;
  desktopFallbackSrc?: string;
  mobileFallbackSrc?: string;
  poster: string;
  mobilePoster?: string;
  /**
   * Alt text for the poster. Ambient footage carries no information the copy
   * does not already state, so the default is decorative.
   */
  alt?: string;
  /** Prose description of the motion, exposed to reduced-motion visitors. */
  description?: string;
  loop?: boolean;
  /** Hero only. Loads eagerly and skips the intersection gate. */
  priority?: boolean;
  objectPosition?: string;
  sizes?: string;
  className?: string;
};

/**
 * A short, silent, atmospheric clip.
 *
 * Every rule the brief sets for video lives here so no section has to remember
 * them: muted, inline, looping, controls-free, paused off-screen, paused in a
 * hidden tab, never loaded before it is needed, and never played at all when
 * the visitor has asked for reduced motion.
 */
export function AmbientVideo({
  desktopSrc,
  mobileSrc,
  desktopFallbackSrc,
  mobileFallbackSrc,
  poster,
  mobilePoster,
  alt = "",
  description,
  loop = true,
  priority = false,
  objectPosition = "center",
  sizes = "100vw",
  className,
}: AmbientVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useMediaQuery(breakpoints.mobile);
  const prefersReducedMotion = useReducedMotion();
  const [hasErrored, setHasErrored] = useState(false);

  // A clip that cannot play is never asked to play again; the poster below it
  // is already a complete image, so there is nothing to retry.
  const canPlay = !prefersReducedMotion && !hasErrored;

  const { shouldLoad, isPlaying } = useIntersectionVideo(videoRef, {
    enabled: canPlay,
    threshold: 0.2,
    // Sources attach a little before the clip is reached so playback starts on
    // arrival rather than after a visible pause.
    rootMargin: "300px 0px",
  });

  const activePoster = resolvePoster(poster, mobilePoster, isMobile);
  const shouldAttachSources = canPlay && (priority || shouldLoad);
  const sources = resolveVideoSources({
    desktopSrc,
    mobileSrc,
    desktopFallbackSrc,
    mobileFallbackSrc,
    isMobile,
  });

  return (
    <div className={[styles.frame, className].filter(Boolean).join(" ")}>
      <Image
        src={activePoster}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={styles.poster}
        style={{ objectPosition }}
      />

      {canPlay ? (
        <video
          ref={videoRef}
          className={styles.video}
          data-playing={isPlaying ? "true" : "false"}
          style={{ objectPosition }}
          muted
          playsInline
          loop={loop}
          disablePictureInPicture
          preload={resolvePreload(priority, shouldLoad)}
          // Ambient footage duplicates what the poster and the copy already
          // convey, so it is removed from the accessibility tree entirely.
          aria-hidden="true"
          tabIndex={-1}
          onError={() => setHasErrored(true)}
        >
          {shouldAttachSources
            ? sources.map((source) => (
                <source key={source.src} src={source.src} type={source.type} />
              ))
            : null}
        </video>
      ) : null}

      <span className={styles.grade} aria-hidden="true" />

      {description ? (
        <span className="visually-hidden">{description}</span>
      ) : null}
    </div>
  );
}
