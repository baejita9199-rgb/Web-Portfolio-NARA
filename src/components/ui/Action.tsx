import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import styles from "./Action.module.css";

type Variant = "primary" | "secondary" | "quiet";
type Tone = "light" | "dark";

type SharedProps = {
  children: ReactNode;
  variant?: Variant;
  tone?: Tone;
  className?: string;
};

function classesFor({ variant = "primary", tone = "light", className }: SharedProps) {
  return [styles.action, styles[variant], className].filter(Boolean).join(" ") + ` ${styles[tone]}`;
}

export type ActionButtonProps = SharedProps &
  Omit<ComponentProps<"button">, "className" | "children">;

/** A button that performs an action in place — opening the booking panel, mostly. */
export function ActionButton({
  children,
  variant,
  tone,
  className,
  type = "button",
  ...rest
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={classesFor({ children, variant, tone, className })}
      {...rest}
    >
      <span className={styles.label}>{children}</span>
    </button>
  );
}

export type ActionLinkProps = SharedProps &
  Omit<ComponentProps<typeof Link>, "className" | "children">;

/** A link styled as an invitation rather than a conversion button. */
export function ActionLink({
  children,
  variant,
  tone,
  className,
  ...rest
}: ActionLinkProps) {
  return (
    <Link className={classesFor({ children, variant, tone, className })} {...rest}>
      <span className={styles.label}>{children}</span>
    </Link>
  );
}

export type TextLinkProps = ComponentProps<typeof Link> & { tone?: Tone };

/** Inline link with an underline that draws in on hover and focus. */
export function TextLink({ className, tone = "light", ...rest }: TextLinkProps) {
  return (
    <Link
      className={[styles.textLink, styles[tone], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
