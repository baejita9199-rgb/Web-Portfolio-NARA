"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * GSAP is the only animation runtime in this project — there is no second
 * motion library, no smooth-scroll wrapper and no scroll hijacking. ScrollTrigger
 * is registered exactly once, guarded so React Strict Mode's double-invoke and
 * any accidental re-import cannot register it twice.
 */
let registered = false;

export function registerGsap(): typeof gsap {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    // Native scrolling stays in charge; ScrollTrigger only reads it.
    ScrollTrigger.config({ ignoreMobileResize: true });
    registered = true;
  }
  return gsap;
}

export { gsap, ScrollTrigger };
