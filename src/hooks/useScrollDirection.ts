"use client";

import { useEffect, useRef, useState } from "react";

export type ScrollDirection = "up" | "down";

export type ScrollState = {
  direction: ScrollDirection;
  /** True while the document is within `topThreshold` of the very top. */
  isAtTop: boolean;
};

const DEFAULT_TOP_THRESHOLD = 24;
/** Ignore jitter below this many pixels so the nav does not flicker. */
const DEFAULT_DELTA = 8;

/**
 * Reports scroll direction without re-rendering on every frame.
 *
 * The listener is passive and rAF-throttled, and `setState` only fires when the
 * direction or the at-top flag actually flips — typically a handful of renders
 * across an entire page scroll.
 */
export function useScrollDirection(
  topThreshold = DEFAULT_TOP_THRESHOLD,
  delta = DEFAULT_DELTA,
): ScrollState {
  const [state, setState] = useState<ScrollState>({
    direction: "up",
    isAtTop: true,
  });
  const lastY = useRef(0);
  const directionRef = useRef<ScrollDirection>("up");
  const ticking = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    lastY.current = window.scrollY;

    const evaluate = () => {
      ticking.current = false;
      const y = Math.max(window.scrollY, 0);
      const isAtTop = y <= topThreshold;
      const movement = y - lastY.current;

      // Resolved before `setState` rather than inside the updater: an updater
      // must stay pure, and React is free to call it more than once.
      let direction = directionRef.current;
      if (Math.abs(movement) > delta) {
        direction = movement > 0 ? "down" : "up";
        lastY.current = y;
      }
      // Being at the top always reveals the bar, whichever way the last
      // gesture went — otherwise an interrupted smooth scroll can leave it
      // retracted at the very top of the page.
      if (isAtTop) direction = "up";
      directionRef.current = direction;

      setState((previous) =>
        direction === previous.direction && isAtTop === previous.isAtTop
          ? previous
          : { direction, isAtTop },
      );
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(evaluate);
    };

    evaluate();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [topThreshold, delta]);

  return state;
}
