import Image from "next/image";
import type { ArticleBlock } from "@/content/types";
import { imageSizes } from "@/lib/media";
import styles from "./ArticleBody.module.css";

export type ArticleBodyProps = {
  blocks: readonly ArticleBlock[];
};

/**
 * Renders a typed article body.
 *
 * Prose is held to a reading measure while figures and pull quotes are allowed
 * to break out of it — the alternation between the two column widths is what
 * gives a long article its rhythm on screen.
 */
export function ArticleBody({ blocks }: ArticleBodyProps) {
  return (
    <div className={styles.body}>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "subhead":
            return (
              <h2 key={`${block.kind}-${index}`} className={styles.subhead}>
                {block.text}
              </h2>
            );

          case "quote":
            return (
              <blockquote
                key={`${block.kind}-${index}`}
                className={styles.quote}
              >
                <p>{block.text}</p>
                {block.attribution ? (
                  <cite className={styles.attribution}>
                    {block.attribution}
                  </cite>
                ) : null}
              </blockquote>
            );

          case "figure":
            return (
              <figure key={block.image.src} className={styles.figure}>
                <div
                  className={styles.figureFrame}
                  style={{
                    aspectRatio: `${block.image.width} / ${block.image.height}`,
                  }}
                >
                  <Image
                    src={block.image.src}
                    alt={block.image.alt}
                    fill
                    sizes={imageSizes.column}
                    className={styles.figureImage}
                  />
                </div>
                <figcaption className={styles.caption}>
                  {block.caption}
                </figcaption>
              </figure>
            );

          case "list":
            return (
              <div key={`${block.kind}-${index}`} className={styles.listBlock}>
                {block.title ? (
                  <p className={styles.listTitle}>{block.title}</p>
                ) : null}
                <ul className={styles.list} role="list">
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            );

          case "paragraph":
          default:
            return (
              <p key={`${block.kind}-${index}`} className={styles.paragraph}>
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
}
