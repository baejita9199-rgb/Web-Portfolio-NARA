import type { ReactNode } from "react";
import styles from "./SplitMediaText.module.css";

export type SplitMediaTextProps = {
  media: ReactNode;
  children: ReactNode;
  /** Which side the photograph occupies on desktop. Ignored below 48rem. */
  mediaSide?: "left" | "right";
  /** Column weighting. Equal halves are avoided by default — they read static. */
  balance?: "media-lead" | "text-lead" | "even";
  align?: "start" | "center" | "end";
  /** Offsets the media column vertically so the two sides do not line up. */
  offsetMedia?: boolean;
  className?: string;
};

/**
 * The two-column editorial spread: a body of text against a photograph.
 *
 * On desktop the columns are deliberately unequal and slightly offset, which is
 * what separates a magazine spread from a two-up grid. Below 48rem the whole
 * thing collapses to a single vertical column and the text always comes first,
 * regardless of which side the image was on.
 */
export function SplitMediaText({
  media,
  children,
  mediaSide = "right",
  balance = "media-lead",
  align = "start",
  offsetMedia = true,
  className,
}: SplitMediaTextProps) {
  return (
    <div
      className={[styles.split, className].filter(Boolean).join(" ")}
      data-media-side={mediaSide}
      data-balance={balance}
      data-align={align}
      data-offset={offsetMedia ? "true" : "false"}
    >
      <div className={styles.text}>{children}</div>
      <div className={styles.media}>{media}</div>
    </div>
  );
}
