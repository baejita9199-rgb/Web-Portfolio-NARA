"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { breakpoints, useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./HorizontalGallery.module.css";

export type HorizontalGalleryProps = {
  /** Names the scrollable region for assistive technology. */
  ariaLabel: string;
  count: number;
  /** Fired only when the settled item actually changes, never per frame. */
  onActiveIndexChange?: (index: number) => void;
  /** Slides. Each direct child is treated as one item. */
  children: ReactNode;
  /** Rendered between the previous and next controls. */
  controlsSlot?: ReactNode;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
};

/**
 * A horizontally scrolling editorial track.
 *
 * This is a native scroll container, not a carousel engine. The page's own
 * vertical scrolling is never captured or translated, there is no pinning and
 * no library — which means it behaves correctly with a trackpad, a touch swipe,
 * a keyboard, a screen reader and reduced motion without any of them being a
 * special case. Snapping is `proximity` rather than `mandatory` so a visitor can
 * still stop between two plates if they want to.
 */
export function HorizontalGallery({
  ariaLabel,
  count,
  onActiveIndexChange,
  children,
  controlsSlot,
  previousLabel = "Previous",
  nextLabel = "Next",
  className,
}: HorizontalGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const activeIndexRef = useRef(0);
  /**
   * The plate a control has asked for but the smooth scroll has not reached
   * yet. Without it, two quick presses of "next" both start from the measured
   * index — still 0 mid-flight — and the second press is silently swallowed.
   */
  const pendingIndexRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const canDrag = useMediaQuery(breakpoints.hover);

  const commitIndex = useCallback(
    (index: number) => {
      // The requested plate has arrived; later presses start from here again.
      if (pendingIndexRef.current === index) pendingIndexRef.current = null;
      if (index === activeIndexRef.current) return;
      activeIndexRef.current = index;
      setActiveIndex(index);
      onActiveIndexChange?.(index);
    },
    [onActiveIndexChange],
  );

  /** Where the next step should start from: the pending target if one is in flight. */
  const currentTargetIndex = () =>
    pendingIndexRef.current ?? activeIndexRef.current;

  /**
   * The active item is the one whose leading edge the track is resting on.
   *
   * Measuring against the track's geometric centre would be wrong for a
   * left-aligned editorial track: at `scrollLeft: 0` the centre of the viewport
   * already sits nearer the *second* plate, so an untouched gallery would
   * announce itself as "02 / 03". Leading-edge alignment matches both the
   * reading order and the snap points.
   */
  const measureActiveIndex = useCallback(() => {
    frameRef.current = 0;
    const track = trackRef.current;
    if (!track) return;

    const items = Array.from(
      track.querySelectorAll<HTMLElement>("[data-gallery-item]"),
    );
    const first = items[0];
    if (!first) return;

    // The final plate can rarely reach the leading edge, so the end of the
    // track is treated as selecting the last item outright.
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll > 0 && track.scrollLeft >= maxScroll - 2) {
      commitIndex(items.length - 1);
      return;
    }

    let nearest = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    items.forEach((item, index) => {
      const offset = item.offsetLeft - first.offsetLeft;
      const distance = Math.abs(offset - track.scrollLeft);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        nearest = index;
      }
    });

    commitIndex(nearest);
  }, [commitIndex]);

  // A passive, rAF-throttled listener. React only re-renders when the settled
  // item changes — typically three times across the whole gallery.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => {
      if (frameRef.current) return;
      frameRef.current = window.requestAnimationFrame(measureActiveIndex);
    };

    measureActiveIndex();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [measureActiveIndex]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.min(Math.max(index, 0), count - 1);
      const items = track.querySelectorAll<HTMLElement>("[data-gallery-item]");
      const target = items[clamped];
      const first = items[0];
      if (!target || !first) return;

      pendingIndexRef.current = clamped;
      track.scrollTo({
        // Matches the measurement above: bring the plate's leading edge to the
        // start of the track, letting the browser clamp at either end.
        left: target.offsetLeft - first.offsetLeft,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    },
    [count, prefersReducedMotion],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case "ArrowRight":
          event.preventDefault();
          scrollToIndex(currentTargetIndex() + 1);
          break;
        case "ArrowLeft":
          event.preventDefault();
          scrollToIndex(currentTargetIndex() - 1);
          break;
        case "Home":
          event.preventDefault();
          scrollToIndex(0);
          break;
        case "End":
          event.preventDefault();
          scrollToIndex(count - 1);
          break;
        default:
          break;
      }
    },
    [count, scrollToIndex],
  );

  /**
   * Pointer dragging is added only for mouse-class devices. Touch already has a
   * far better native gesture, and hijacking it would break momentum scrolling.
   */
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    // Any direct interaction supersedes a control-initiated scroll.
    pendingIndexRef.current = null;
    if (!canDrag || event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    drag.current = {
      active: true,
      startX: event.clientX,
      startScroll: track.scrollLeft,
      moved: 0,
    };
    track.dataset.dragging = "true";
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!drag.current.active || !track) return;
    const delta = event.clientX - drag.current.startX;
    drag.current.moved = Math.abs(delta);
    if (drag.current.moved > 4 && !track.hasPointerCapture(event.pointerId)) {
      track.setPointerCapture(event.pointerId);
    }
    track.scrollLeft = drag.current.startScroll - delta;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    if (track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
    // A drag that travelled far enough should not also register as a click on
    // the link underneath it.
    if (drag.current.moved > 6) {
      const suppress = (clickEvent: Event) => {
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
      };
      track.addEventListener("click", suppress, { capture: true, once: true });
      window.setTimeout(() => {
        track.removeEventListener("click", suppress, { capture: true });
      }, 0);
    }
    drag.current.active = false;
    delete track.dataset.dragging;
  };

  return (
    <div className={[styles.gallery, className].filter(Boolean).join(" ")}>
      <div
        ref={trackRef}
        className={styles.track}
        // A scrollable region must be reachable and operable by keyboard alone.
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        data-can-drag={canDrag ? "true" : "false"}
      >
        {children}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.control}
          onClick={() => scrollToIndex(currentTargetIndex() - 1)}
          disabled={activeIndex <= 0}
          aria-label={previousLabel}
        >
          <span aria-hidden="true">&#8592;</span>
        </button>

        {controlsSlot ? (
          <div className={styles.slot}>{controlsSlot}</div>
        ) : null}

        <button
          type="button"
          className={styles.control}
          onClick={() => scrollToIndex(currentTargetIndex() + 1)}
          disabled={activeIndex >= count - 1}
          aria-label={nextLabel}
        >
          <span aria-hidden="true">&#8594;</span>
        </button>
      </div>
    </div>
  );
}
