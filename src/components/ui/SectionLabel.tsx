import styles from "./SectionLabel.module.css";

export type SectionLabelProps = {
  /** Running number, e.g. "02". */
  number?: string;
  /** Short uppercase label, e.g. "The House". */
  label: string;
  tone?: "light" | "dark";
  className?: string;
};

/**
 * The running head that opens each section — a page number and a short label
 * separated by a hairline, borrowed from print. It is decorative typographic
 * furniture, not a heading, so it never enters the heading outline.
 */
export function SectionLabel({
  number,
  label,
  tone = "light",
  className,
}: SectionLabelProps) {
  return (
    <p
      className={[styles.label, className].filter(Boolean).join(" ")}
      data-tone={tone}
    >
      {number ? <span className={styles.number}>{number}</span> : null}
      <span className={styles.rule} aria-hidden="true" />
      <span className={styles.text}>{label}</span>
    </p>
  );
}
