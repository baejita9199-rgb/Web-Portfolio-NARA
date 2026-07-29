"use client";

import { useMediaQuery } from "./useMediaQuery";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * The single authority on whether motion may run.
 *
 * Returns `false` during SSR and the first client render, then flips to the
 * user's real preference. Every animated component gates on this before
 * creating a timeline, so a reduced-motion visitor never has a ScrollTrigger
 * or an autoplaying video created at all — they are not merely paused.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}
