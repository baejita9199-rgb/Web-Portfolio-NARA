"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) =>
      !element.hasAttribute("aria-hidden") &&
      element.offsetWidth + element.offsetHeight > 0,
  );
}

export type UseFocusTrapOptions = {
  active: boolean;
  onEscape?: () => void;
  /** Focused on open. Defaults to the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * Confines Tab to a container while it is open, and puts focus back where it
 * came from when it closes.
 *
 * The element that had focus at open time is captured synchronously — after the
 * overlay renders it is too late, because focus has already moved.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  { active, onEscape, initialFocusRef }: UseFocusTrapOptions,
): void {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const focusTarget =
      initialFocusRef?.current ?? getFocusable(container)[0] ?? container;
    // Deferred a frame so the element is laid out and actually focusable.
    const focusFrame = window.requestAnimationFrame(() => {
      focusTarget.focus({ preventScroll: true });
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onEscape?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusable(container);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      const activeElement = document.activeElement;
      if (event.shiftKey && (activeElement === first || activeElement === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      // `isConnected` guards the case where the trigger itself was unmounted
      // while the overlay was open.
      if (previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [active, containerRef, onEscape, initialFocusRef]);
}
