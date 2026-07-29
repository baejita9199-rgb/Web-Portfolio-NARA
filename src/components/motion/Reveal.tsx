"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { registerGsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./Reveal.module.css";

export type RevealVariant = "text" | "mask" | "rule";

export type RevealProps = {
  children: ReactNode;
  /**
   * `text` lifts and fades, `mask` wipes a media frame open from the bottom,
   * `rule` draws a hairline across. Nothing rotates, skews or bounces.
   */
  variant?: RevealVariant;
  /** Seconds of delay, used to stagger sibling paragraphs. */
  delay?: number;
  /** Stagger applied across direct children when `splitChildren` is set. */
  stagger?: number;
  splitChildren?: boolean;
  as?: ElementType;
  className?: string;
};

/**
 * Scroll-triggered entrance for editorial content.
 *
 * Elements are hidden by CSS only while `data-reveal-ready="true"` — a flag
 * this component sets from JavaScript. If scripting fails, or the visitor has
 * reduced motion enabled, the attribute is never written and the content is
 * simply visible. Content can therefore never be trapped in a hidden state.
 */
export function Reveal({
  children,
  variant = "text",
  delay = 0,
  stagger = 0.09,
  splitChildren = false,
  as: Tag = "div",
  className,
}: RevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion) return;

    const gsap = registerGsap();
    const targets: Element[] = splitChildren
      ? Array.from(container.children)
      : [container];
    if (targets.length === 0) return;

    container.dataset.revealReady = "true";

    const context = gsap.context(() => {
      const from =
        variant === "mask"
          ? { clipPath: "inset(100% 0% 0% 0%)", scale: 1.04 }
          : variant === "rule"
            ? { scaleX: 0 }
            : { y: 26, opacity: 0 };

      const to =
        variant === "mask"
          ? { clipPath: "inset(0% 0% 0% 0%)", scale: 1 }
          : variant === "rule"
            ? { scaleX: 1 }
            : { y: 0, opacity: 1 };

      gsap.fromTo(targets, from, {
        ...to,
        duration: variant === "mask" ? 1.35 : 1.05,
        ease: "power2.out",
        delay,
        stagger: splitChildren ? stagger : 0,
        clearProps: "clipPath,transform",
        scrollTrigger: {
          trigger: container,
          start: "top 88%",
          once: true,
        },
      });
    }, container);

    return () => {
      context.revert();
      delete container.dataset.revealReady;
    };
  }, [prefersReducedMotion, variant, delay, stagger, splitChildren]);

  return (
    <Tag
      ref={containerRef}
      className={[styles.reveal, styles[variant], className]
        .filter(Boolean)
        .join(" ")}
      data-reveal-split={splitChildren ? "true" : undefined}
    >
      {children}
    </Tag>
  );
}

/** Mask-wipe reveal for media frames. Named separately for readability at call sites. */
export function ImageReveal(props: Omit<RevealProps, "variant">) {
  return <Reveal {...props} variant="mask" />;
}
