"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBooking } from "@/components/booking/BookingProvider";
import { ActionButton } from "@/components/ui/Action";
import { navigationLinks, site } from "@/content/site";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import styles from "./SiteNavigation.module.css";

/** The section the navigation floats over while it is still transparent. */
const HERO_SECTION_ID = "arrival";

export function SiteNavigation() {
  const pathname = usePathname();
  const { open: openBooking } = useBooking();
  const { direction, isAtTop } = useScrollDirection();
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  /**
   * The menu records the route it was opened on. Deriving "open" from that
   * comparison means a route change closes it automatically — no effect
   * synchronising one piece of state against another.
   */
  const [menu, setMenu] = useState({ open: false, path: "/" });
  const menuRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === "/";
  const isMenuOpen = menu.open && menu.path === pathname;

  /**
   * The transparent-to-solid switch is driven by the hero's own position rather
   * than a hard-coded scroll offset, so it stays correct at any viewport height.
   * Only the home page has a hero; everywhere else the bar is solid from the
   * start, which is what `isHome` expresses here.
   */
  useEffect(() => {
    const hero = document.getElementById(HERO_SECTION_ID);
    if (!hero) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setIsHeroVisible(entry.isIntersecting);
      },
      // Flips exactly as the bottom of the hero reaches the underside of the bar.
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  const isOverHero = isHome && isHeroVisible;

  const closeMenu = useCallback(() => {
    setMenu((previous) => (previous.open ? { ...previous, open: false } : previous));
  }, []);

  useBodyScrollLock(isMenuOpen);
  useFocusTrap(menuRef, { active: isMenuOpen, onEscape: closeMenu });

  const isHidden = !isMenuOpen && direction === "down" && !isAtTop;
  const tone = isOverHero && !isMenuOpen ? "dark" : "light";

  const resolveHref = (href: string) =>
    isHome || !href.startsWith("#") ? href : `/${href}`;

  return (
    <>
      <header
        className={styles.header}
        data-hidden={isHidden ? "true" : "false"}
        data-transparent={isOverHero && !isMenuOpen ? "true" : "false"}
        data-surface={tone === "dark" ? "dark" : undefined}
      >
        <nav className={styles.bar} aria-label="Primary">
          <Link href="/" className={styles.wordmark} onClick={closeMenu}>
            <span className={styles.wordmarkPrimary}>{site.wordmark[0]}</span>
            <span className={styles.wordmarkSecondary}>{site.wordmark[1]}</span>
          </Link>

          <ul className={styles.links} role="list">
            {navigationLinks.map((link) => (
              <li key={link.href}>
                <Link className={styles.link} href={resolveHref(link.href)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <ActionButton
              variant="secondary"
              tone={tone}
              className={styles.bookingCta}
              onClick={openBooking}
            >
              Check availability
            </ActionButton>

            <button
              type="button"
              className={styles.menuToggle}
              aria-expanded={isMenuOpen}
              aria-controls="site-menu"
              onClick={() =>
                setMenu((previous) => ({
                  open: !(previous.open && previous.path === pathname),
                  path: pathname,
                }))
              }
            >
              <span className={styles.menuIcon} aria-hidden="true">
                <span data-line="1" />
                <span data-line="2" />
              </span>
              <span className="visually-hidden">
                {isMenuOpen ? "Close menu" : "Open menu"}
              </span>
            </button>
          </div>
      </nav>
      </header>

      {/*
        Rendered as a sibling of the banner, not inside it. The header carries a
        `transform` for its hide-on-scroll behaviour, which would make it the
        containing block for any `position: fixed` descendant — collapsing this
        panel to the height of the bar itself. Outside it, the panel resolves
        against the viewport as intended.
      */}
      <div
        id="site-menu"
        ref={menuRef}
        className={styles.menu}
        data-open={isMenuOpen ? "true" : "false"}
        hidden={!isMenuOpen}
      >
        <div className={styles.menuInner}>
          <nav aria-label="Menu">
            <ul className={styles.menuLinks} role="list">
              {navigationLinks.map((link, index) => (
                <li key={link.href}>
                  <Link
                    className={styles.menuLink}
                    href={resolveHref(link.href)}
                    onClick={closeMenu}
                  >
                    <span className={styles.menuNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.menuFooter}>
            <ActionButton
              variant="primary"
              onClick={() => {
                closeMenu();
                openBooking();
              }}
            >
              Check availability
            </ActionButton>
            <p className={styles.menuNote}>
              {site.location.label} — {site.location.detail}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
