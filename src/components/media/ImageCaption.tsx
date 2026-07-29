import type { ReactNode } from "react";
import styles from "./ImageCaption.module.css";

export type ImageCaptionProps = {
  children: ReactNode;
  /** Optional plate number or short label set above the caption. */
  plate?: string;
  tone?: "light" | "dark";
  align?: "start" | "end";
  className?: string;
};

/**
 * A standalone magazine caption, for the cases where the text sits apart from
 * its image rather than directly beneath it (offset columns, overlapping
 * plates). Where a caption belongs to one photograph, `EditorialImage` renders
 * a proper `<figcaption>` instead.
 */
export function ImageCaption({
  children,
  plate,
  tone = "light",
  align = "start",
  className,
}: ImageCaptionProps) {
  return (
    <div
      className={[styles.caption, className].filter(Boolean).join(" ")}
      data-tone={tone}
      data-align={align}
    >
      {plate ? <span className={styles.plate}>{plate}</span> : null}
      <span className={styles.body}>{children}</span>
    </div>
  );
}
