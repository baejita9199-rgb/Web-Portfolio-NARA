"use client";

import { useEffect, useState } from "react";

export type ViewportSize = {
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
};

const SERVER_SIZE: ViewportSize = {
  width: 0,
  height: 0,
  orientation: "portrait",
};

/**
 * Viewport dimensions, rAF-throttled and updated on both resize and orientation
 * change. Values are only committed when they differ, so a mobile browser's
 * address-bar collapse does not cause a render storm.
 */
export function useViewportSize(): ViewportSize {
  const [size, setSize] = useState<ViewportSize>(SERVER_SIZE);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation = width >= height ? "landscape" : "portrait";
      setSize((previous) =>
        previous.width === width &&
        previous.height === height &&
        previous.orientation === orientation
          ? previous
          : { width, height, orientation },
      );
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", schedule, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
  }, []);

  return size;
}
