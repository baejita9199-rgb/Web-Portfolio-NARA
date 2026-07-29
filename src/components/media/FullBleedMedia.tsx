import type { ReactNode } from "react";
import styles from "./FullBleedMedia.module.css";

export type FullBleedMediaProps = {
  media: ReactNode;
  children?: ReactNode;
  /** `screen` uses 100dvh so mobile browser chrome cannot clip the composition. */
  height?: "screen" | "tall" | "medium" | "auto";
  /** Scrim strength beneath overlaid type. Chosen for contrast, not for drama. */
  overlay?: "none" | "soft" | "medium" | "strong";
  /**
   * `corner` adds a second wash from the leading edge. Copy set against the
   * left of a photograph needs it: a purely vertical scrim leaves the middle of
   * the frame — exactly where a headline sits — almost untouched.
   */
  scrimFocus?: "bottom" | "corner";
  align?: "start" | "center" | "end";
  justify?: "start" | "center" | "end";
  className?: string;
  contentClassName?: string;
};

/**
 * Edge-to-edge media with typography laid over it.
 *
 * The scrim is a separate layer rather than a filter on the media so the
 * photograph itself is never darkened more than the type needs — the palette
 * stays warm and nothing acquires the heavy black wash of a stock hero.
 */
export function FullBleedMedia({
  media,
  children,
  height = "tall",
  overlay = "soft",
  scrimFocus = "bottom",
  align = "end",
  justify = "start",
  className,
  contentClassName,
}: FullBleedMediaProps) {
  return (
    <div
      className={[styles.bleed, className].filter(Boolean).join(" ")}
      data-height={height}
      data-surface="dark"
    >
      <div className={styles.media}>{media}</div>
      {overlay !== "none" ? (
        <div
          className={styles.scrim}
          data-overlay={overlay}
          data-focus={scrimFocus}
          aria-hidden="true"
        />
      ) : null}
      {children ? (
        <div
          className={[styles.content, contentClassName]
            .filter(Boolean)
            .join(" ")}
          data-align={align}
          data-justify={justify}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
