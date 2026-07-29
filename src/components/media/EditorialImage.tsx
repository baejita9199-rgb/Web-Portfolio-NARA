import Image from "next/image";
import type { ReactNode } from "react";
import type { ImageAsset } from "@/content/types";
import { imageSizes } from "@/lib/media";
import styles from "./EditorialImage.module.css";

export type EditorialImageProps = {
  image: ImageAsset;
  /** Overrides the asset's own ratio, e.g. to crop a landscape file to 4:5. */
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  objectPosition?: string;
  caption?: ReactNode;
  /** Small plate number printed beside the caption, magazine-style. */
  plate?: string;
  className?: string;
  frameClassName?: string;
};

/**
 * A single photograph with its caption.
 *
 * The frame carries the aspect ratio, so the space is reserved before the file
 * arrives and nothing on the page shifts as images decode. Ratios are passed in
 * per call rather than fixed globally — a page where every image is the same
 * shape is the fastest way to look like a template.
 */
export function EditorialImage({
  image,
  ratio,
  sizes = imageSizes.half,
  priority = false,
  objectPosition = "center",
  caption,
  plate,
  className,
  frameClassName,
}: EditorialImageProps) {
  const aspectRatio = ratio ?? `${image.width} / ${image.height}`;

  const figure = (
    <div
      className={[styles.frame, frameClassName].filter(Boolean).join(" ")}
      style={{ aspectRatio }}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className={styles.image}
        style={{ objectPosition }}
      />
    </div>
  );

  if (!caption && !plate) {
    return (
      <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
        {figure}
      </div>
    );
  }

  return (
    <figure className={[styles.wrapper, className].filter(Boolean).join(" ")}>
      {figure}
      <figcaption className={styles.caption}>
        {plate ? <span className={styles.plate}>{plate}</span> : null}
        {caption ? <span className={styles.captionText}>{caption}</span> : null}
      </figcaption>
    </figure>
  );
}
