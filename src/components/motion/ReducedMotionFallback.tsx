"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type ReducedMotionFallbackProps = {
  /** Rendered when motion is welcome. */
  children: ReactNode;
  /** Rendered instead when the visitor has asked for reduced motion. */
  fallback: ReactNode;
};

/**
 * Swaps an animated treatment for a still one.
 *
 * This is for the handful of places where reduced motion needs a genuinely
 * different composition rather than the same composition held still. It must
 * never be used to drop content: the fallback is always required, and always
 * carries the same information as the branch it replaces.
 */
export function ReducedMotionFallback({
  children,
  fallback,
}: ReducedMotionFallbackProps) {
  const prefersReducedMotion = useReducedMotion();
  return <>{prefersReducedMotion ? fallback : children}</>;
}
