"use client";

import { useRef, type ReactNode } from "react";
import { overscanPercent, useParallax } from "@/hooks/useParallax";
import styles from "./ParallaxMedia.module.css";

export type ParallaxMediaProps = {
  children: ReactNode;
  /** Clamped to ±0.15 by the hook. Positive lags the scroll, negative leads it. */
  speed?: number;
  scaleFrom?: number;
  scaleTo?: number;
  direction?: "vertical" | "horizontal";
  disabledOnMobile?: boolean;
  /** CSS aspect-ratio for the frame, e.g. "4 / 5". */
  ratio?: string;
  className?: string;
};

/**
 * A fixed-ratio window with media that drifts against the scroll behind it.
 *
 * The inner layer is oversized by exactly the distance it will travel, so the
 * frame can never reveal an uncovered edge at either end of the scrub. When
 * parallax is off — reduced motion, or mobile where the travel is not worth the
 * work — the inner layer keeps its overscan but simply does not move, which
 * means the crop stays identical either way.
 */
export function ParallaxMedia({
  children,
  speed = 0.08,
  scaleFrom = 1,
  scaleTo = 1,
  direction = "vertical",
  disabledOnMobile = false,
  ratio,
  className,
}: ParallaxMediaProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useParallax(frameRef, innerRef, {
    speed,
    scaleFrom,
    scaleTo,
    direction,
    disabledOnMobile,
  });

  const overscan = overscanPercent(speed);
  const isHorizontal = direction === "horizontal";

  return (
    <div
      ref={frameRef}
      className={[styles.frame, className].filter(Boolean).join(" ")}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      <div
        ref={innerRef}
        className={styles.inner}
        style={
          isHorizontal
            ? {
                left: `${-overscan}%`,
                width: `${100 + overscan * 2}%`,
                height: "100%",
                top: 0,
              }
            : {
                top: `${-overscan}%`,
                height: `${100 + overscan * 2}%`,
                width: "100%",
                left: 0,
              }
        }
      >
        {children}
      </div>
    </div>
  );
}
