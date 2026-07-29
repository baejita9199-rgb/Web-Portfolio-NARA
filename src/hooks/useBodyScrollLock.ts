"use client";

import { useEffect } from "react";

/**
 * Reference-counted body scroll lock.
 *
 * The mobile menu and the booking modal can both be mounted at once; a naive
 * lock would be released by whichever closed first. The counter guarantees the
 * page only scrolls again when the last overlay has gone, and the scrollbar
 * width is compensated so the layout does not jump on desktop.
 */
let lockCount = 0;
let previousPaddingRight = "";

function applyLock(): void {
  const { body, documentElement } = document;
  const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
  previousPaddingRight = body.style.paddingRight;
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
  }
  body.dataset.scrollLocked = "true";
}

function releaseLock(): void {
  const { body } = document;
  body.style.paddingRight = previousPaddingRight;
  delete body.dataset.scrollLocked;
}

export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;

    lockCount += 1;
    if (lockCount === 1) applyLock();

    return () => {
      lockCount = Math.max(lockCount - 1, 0);
      if (lockCount === 0) releaseLock();
    };
  }, [active]);
}
