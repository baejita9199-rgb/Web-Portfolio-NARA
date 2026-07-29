"use client";

import { useEffect, useState, type RefObject } from "react";
import { useDocumentVisibility } from "./useDocumentVisibility";
import { useInView } from "./useInView";

export type UseIntersectionVideoOptions = {
  /** When false the element is never played — used for reduced motion. */
  enabled?: boolean;
  /** Fraction of the element that must be visible before playback begins. */
  threshold?: number;
  /** Grown for lazy attachment so sources are ready just before they are seen. */
  rootMargin?: string;
};

export type IntersectionVideoState = {
  /** True while the element is inside the viewport. */
  isInView: boolean;
  /** Latches once the element has approached the viewport. Gates `<source>`. */
  shouldLoad: boolean;
  /** True while the element is intended to be playing. */
  isPlaying: boolean;
};

/**
 * Drives an ambient `<video>` from viewport and tab visibility.
 *
 * Playback is the product of three conditions — enabled, on screen, tab
 * visible — so leaving the tab or scrolling a clip away always stops decoding.
 * `play()` returns a promise that rejects when a pause interrupts it; that
 * rejection is expected during fast scrolling and is swallowed deliberately.
 */
export function useIntersectionVideo(
  videoRef: RefObject<HTMLVideoElement | null>,
  {
    enabled = true,
    threshold = 0.25,
    rootMargin = "200px 0px",
  }: UseIntersectionVideoOptions = {},
): IntersectionVideoState {
  const { isInView, hasBeenInView } = useInView(videoRef, {
    threshold,
    rootMargin,
  });
  const isDocumentVisible = useDocumentVisibility();
  /** Set only from the `play()` promise — never synchronously from an effect. */
  const [playbackStarted, setPlaybackStarted] = useState(false);

  const shouldPlay = enabled && isInView && isDocumentVisible;
  // Derived rather than stored, so scrolling a clip away reports "not playing"
  // in the same render that stops it, with no extra state round-trip.
  const isPlaying = shouldPlay && playbackStarted;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    if (!shouldPlay) {
      if (!video.paused) video.pause();
      return;
    }

    const result = video.play();
    if (result && typeof result.then === "function") {
      result.then(
        () => {
          if (!cancelled) setPlaybackStarted(true);
        },
        () => {
          // Autoplay refused, or a pause interrupted the request. Either way the
          // poster remains visible and nothing is logged to the console.
          if (!cancelled) setPlaybackStarted(false);
        },
      );
    }

    return () => {
      cancelled = true;
    };
  }, [shouldPlay, videoRef]);

  // A clip that is scrolled away and later returned to should restart from a
  // clean point rather than resuming mid-gesture.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isInView) return;
    if (video.currentTime > 0.05) {
      try {
        video.currentTime = 0;
      } catch {
        // Some browsers reject seeks before metadata is available.
      }
    }
  }, [isInView, videoRef]);

  return { isInView, shouldLoad: hasBeenInView, isPlaying };
}
