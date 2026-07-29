"use client";

import { useEffect, useState, type RefObject } from "react";

export type UseInViewOptions = {
  threshold?: number | number[];
  rootMargin?: string;
  /** Once true, `hasBeenInView` latches and the observer disconnects. */
  once?: boolean;
};

export type InViewState = {
  isInView: boolean;
  hasBeenInView: boolean;
};

/**
 * Thin, cleanup-safe IntersectionObserver binding.
 *
 * `hasBeenInView` is what gates lazy media attachment: a source is only written
 * to the DOM after the element has approached the viewport once, and it stays
 * attached afterwards so scrolling back never re-downloads.
 */
export function useInView(
  ref: RefObject<Element | null>,
  { threshold = 0.2, rootMargin = "0px", once = false }: UseInViewOptions = {},
): InViewState {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    // No observer means no ambient playback: every consumer of this hook keeps
    // showing its poster, which is the designed fallback rather than a loss of
    // content. Nothing readable is ever gated on the result.
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasBeenInView(true);
          if (once) observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
    // `threshold` is allowed to be an array; callers pass literals or constants.
  }, [ref, rootMargin, once, threshold]);

  return { isInView, hasBeenInView };
}
