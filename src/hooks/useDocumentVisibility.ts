"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tracks `document.visibilityState`.
 *
 * Backgrounded tabs keep decoding video in some browsers; pairing this with the
 * intersection state means a clip only ever runs when it is both on screen and
 * in a visible tab.
 */
export function useDocumentVisibility(): boolean {
  const subscribe = useCallback((onStoreChange: () => void) => {
    if (typeof document === "undefined") return () => {};
    document.addEventListener("visibilitychange", onStoreChange);
    return () => document.removeEventListener("visibilitychange", onStoreChange);
  }, []);

  const getSnapshot = useCallback(() => {
    if (typeof document === "undefined") return true;
    return document.visibilityState !== "hidden";
  }, []);

  const getServerSnapshot = useCallback(() => true, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
