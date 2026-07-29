"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a media query without ever reading `window` during render.
 *
 * `useSyncExternalStore` gives us the server snapshot (`false`) on the first
 * paint and swaps to the real value in the same commit that hydration finishes,
 * so no layout is produced from a guessed viewport.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) {
        return () => {};
      }
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Breakpoints shared by JS behaviour and CSS modules. Keep the two in step. */
export const breakpoints = {
  mobile: "(max-width: 47.99rem)",
  tablet: "(min-width: 48rem) and (max-width: 63.99rem)",
  desktop: "(min-width: 64rem)",
  /** True for input devices that can genuinely hover — never a width proxy. */
  hover: "(hover: hover) and (pointer: fine)",
} as const;
