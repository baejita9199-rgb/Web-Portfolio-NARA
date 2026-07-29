"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * False during server rendering and the hydration pass, true from the first
 * client render onwards.
 *
 * This is how a component defers a decision that depends on the viewport. Any
 * markup produced before hydration has to match what the server sent, so a
 * media-query-dependent `<source>` written during that pass would necessarily
 * be the server's guess — and for a video the browser starts fetching that
 * guess before React ever gets to correct it.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
