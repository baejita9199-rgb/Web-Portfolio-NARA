"use client";

import { type RefObject } from "react";
import { registerGsap, ScrollTrigger } from "@/lib/gsap";
import { breakpoints, useMediaQuery } from "./useMediaQuery";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Parallax speed is deliberately capped. Beyond roughly 15% of the frame the
 * effect stops reading as depth and starts reading as a mistake, so the value
 * is clamped here rather than trusted from the call site.
 */
export const MAX_PARALLAX_SPEED = 0.15;

export function clampParallaxSpeed(speed: number): number {
  if (!Number.isFinite(speed)) return 0;
  return Math.min(Math.max(speed, -MAX_PARALLAX_SPEED), MAX_PARALLAX_SPEED);
}

/**
 * The inner media layer is oversized by the travel distance in each direction,
 * so the frame never shows an uncovered edge at either end of the scrub.
 */
export function overscanPercent(speed: number): number {
  return Math.abs(clampParallaxSpeed(speed)) * 100;
}

/**
 * Travel expressed as a percentage of the *inner* element's height, which is
 * what `yPercent` is relative to. Keeping the maths here means the component
 * only has to render the box.
 */
export function travelPercent(speed: number): number {
  const clamped = clampParallaxSpeed(speed);
  const overscan = Math.abs(clamped);
  if (overscan === 0) return 0;
  return (100 * clamped) / (1 + 2 * overscan);
}

export type UseParallaxOptions = {
  /** -0.15 … 0.15. Positive lags behind the scroll, negative leads it. */
  speed?: number;
  scaleFrom?: number;
  scaleTo?: number;
  direction?: "vertical" | "horizontal";
  disabledOnMobile?: boolean;
  /** Escape hatch for callers that own their own enable/disable logic. */
  disabled?: boolean;
};

/**
 * Scrubs a transform on `targetRef` across the time `triggerRef` spends in the
 * viewport.
 *
 * Only `transform` is animated — never layout properties — and the whole
 * timeline lives inside a `gsap.context()` scoped to the trigger element, so a
 * single `ctx.revert()` removes the tween, its ScrollTrigger and every inline
 * style it wrote. Reduced motion prevents the context from being created at
 * all, which is why there is nothing to tear down in that case.
 */
export function useParallax<T extends HTMLElement, U extends HTMLElement>(
  triggerRef: RefObject<T | null>,
  targetRef: RefObject<U | null>,
  {
    speed = 0.08,
    scaleFrom = 1,
    scaleTo = 1,
    direction = "vertical",
    disabledOnMobile = false,
    disabled = false,
  }: UseParallaxOptions = {},
): void {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useMediaQuery(breakpoints.mobile);
  const isActive =
    !disabled && !prefersReducedMotion && !(disabledOnMobile && isMobile);

  // The motion parameters are part of a call site's composition, not runtime
  // state — they are depended on directly so a genuine change rebuilds the
  // timeline instead of being silently ignored.
  useIsomorphicLayoutEffect(() => {
    const trigger = triggerRef.current;
    const target = targetRef.current;
    if (!isActive || !trigger || !target) return;

    const gsap = registerGsap();

    const travel = travelPercent(speed);
    const axisKey = direction === "horizontal" ? "xPercent" : "yPercent";
    const hasShift = travel !== 0;
    const hasScale = scaleFrom !== scaleTo;
    if (!hasShift && !hasScale) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        target,
        {
          ...(hasShift ? { [axisKey]: -travel } : {}),
          ...(hasScale ? { scale: scaleFrom } : {}),
        },
        {
          ...(hasShift ? { [axisKey]: travel } : {}),
          ...(hasScale ? { scale: scaleTo } : {}),
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger,
            start: "top bottom",
            end: "bottom top",
            // A short scrub smooths sub-pixel jitter without ever lagging
            // perceptibly behind the user's scroll.
            scrub: 0.35,
            invalidateOnRefresh: true,
          },
        },
      );
    }, trigger);

    return () => context.revert();
  }, [
    isActive,
    triggerRef,
    targetRef,
    speed,
    scaleFrom,
    scaleTo,
    direction,
  ]);

  // Orientation changes resize the viewport without always firing `resize` on
  // iOS; an explicit refresh keeps trigger positions honest.
  useIsomorphicLayoutEffect(() => {
    if (!isActive || typeof window === "undefined") return;
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("orientationchange", refresh);
    return () => window.removeEventListener("orientationchange", refresh);
  }, [isActive]);
}
