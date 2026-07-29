"use client";

import { useRef } from "react";
import { useBooking } from "@/components/booking/BookingProvider";
import { AmbientVideo } from "@/components/media/AmbientVideo";
import { FullBleedMedia } from "@/components/media/FullBleedMedia";
import { ParallaxMedia } from "@/components/media/ParallaxMedia";
import { ActionButton, ActionLink } from "@/components/ui/Action";
import { naraAssets } from "@/content/assets";
import { site } from "@/content/site";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { registerGsap } from "@/lib/gsap";
import styles from "./HeroArrival.module.css";

/**
 * Section 01 — Arrival.
 *
 * The only full-height video on the page. Everything below it is carried by
 * stills, so this is the one clip that is allowed to load eagerly.
 */
export function HeroArrival() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { open: openBooking } = useBooking();
  const prefersReducedMotion = useReducedMotion();

  // Entrance, then a slow dissolve as the visitor leaves. Both live in one
  // context so a single revert removes the timeline and the ScrollTrigger.
  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content || prefersReducedMotion) return;

    const gsap = registerGsap();
    content.dataset.heroReady = "true";

    const context = gsap.context(() => {
      const lines = content.querySelectorAll("[data-hero-line]");

      gsap.fromTo(
        lines,
        { y: 30, opacity: 0, clipPath: "inset(0% 0% 100% 0%)" },
        {
          y: 0,
          opacity: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.5,
          ease: "power2.out",
          // Slow and even. Never a per-character flicker.
          stagger: 0.16,
          delay: 0.25,
          clearProps: "clipPath",
        },
      );

      gsap.to(content, {
        opacity: 0,
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom 40%",
          scrub: 0.4,
        },
      });
    }, section);

    return () => {
      context.revert();
      delete content.dataset.heroReady;
    };
  }, [prefersReducedMotion]);

  return (
    <section
      id="arrival"
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="hero-title"
    >
      <FullBleedMedia
        height="screen"
        overlay="soft"
        scrimFocus="corner"
        align="end"
        media={
          <ParallaxMedia
            speed={0.06}
            scaleFrom={1.02}
            scaleTo={1.06}
            className={styles.mediaFrame}
          >
            <AmbientVideo
              desktopSrc={naraAssets.hero.desktopVideo}
              mobileSrc={naraAssets.hero.mobileVideo}
              desktopFallbackSrc={naraAssets.hero.desktopFallback}
              mobileFallbackSrc={naraAssets.hero.mobileFallback}
              poster={naraAssets.hero.desktopPoster}
              mobilePoster={naraAssets.hero.mobilePoster}
              alt=""
              description="Morning mist drifting slowly through forested ridgelines above the house."
              priority
              sizes="100vw"
            />
          </ParallaxMedia>
        }
      >
        <div ref={contentRef} className={styles.content}>
          <p className={styles.index} data-hero-line>
            <span>01</span>
            <span className={styles.indexRule} aria-hidden="true" />
            <span>Arrival</span>
          </p>

          <h1 id="hero-title" className={styles.title} data-hero-line>
            {site.wordmark[0]}{" "}
            <span className={styles.titleSecondary}>{site.wordmark[1]}</span>
          </h1>

          <p className={styles.tagline} data-hero-line>
            {site.tagline}
          </p>

          <p className={styles.intro} data-hero-line>
            {site.intro}
          </p>

          <div className={styles.actions} data-hero-line>
            <ActionLink href="#the-house" variant="primary" tone="dark">
              Explore the house
            </ActionLink>
            <ActionButton variant="secondary" tone="dark" onClick={openBooking}>
              Check availability
            </ActionButton>
          </div>
        </div>
      </FullBleedMedia>

      <p className={styles.location}>
        <span>{site.location.label}</span>
        <span className={styles.locationDetail}>{site.location.detail}</span>
      </p>

      <div className={styles.scrollHint} aria-hidden="true">
        <span className={styles.scrollLabel}>Scroll</span>
        <span className={styles.scrollLine} />
      </div>
    </section>
  );
}
