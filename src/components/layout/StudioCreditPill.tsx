"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { STUDIO_CONTACT_URL, STUDIO_WORK_URL } from "@/lib/studio-links";
import styles from "./StudioCreditPill.module.css";

/**
 * The way back to the studio, and the standing statement that NARA HOUSE is
 * not a real place.
 *
 * The footer already says so, but a visitor who arrives from an image search
 * and reads only the hero never gets there — and this hero is convincing
 * enough that somebody could try to book a room. The pill stays collapsed so
 * it never competes with the photography; it opens on hover for a pointer and
 * on tap for a touch screen.
 */
export function StudioCreditPill() {
  const [open, setOpen] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // เบราว์เซอร์บนมือถือยิง mouseenter ให้ก่อน click เพื่อความเข้ากันได้
  // ถ้าเปิดด้วย hover ไปแล้ว click จะสลับกลับเป็นปิดทันที = แตะเท่าไรก็ไม่กาง
  // จึงต้องผูก hover เฉพาะเครื่องที่ชี้เมาส์ได้จริง
  useEffect(() => {
    const query = window.matchMedia("(hover: hover)");
    const sync = () => setCanHover(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [close, open]);

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-open={open}
      onMouseEnter={canHover ? () => setOpen(true) : undefined}
      onMouseLeave={canHover ? close : undefined}
    >
      <div className={styles.panel}>
        <div className={styles.panelInner} id="studio-credit-actions">
          <p className={styles.panelHeading}>Concept project · Jedsada Studio</p>
          <a
            className={styles.action}
            href={STUDIO_WORK_URL}
            target="_blank"
            rel="noreferrer"
          >
            <span aria-hidden="true" className={styles.arrow}>
              ↗
            </span>
            See all work
          </a>
          <a
            className={styles.action}
            href={STUDIO_CONTACT_URL}
            target="_blank"
            rel="noreferrer"
          >
            <span aria-hidden="true" className={styles.arrow}>
              ↗
            </span>
            Start a project
          </a>
        </div>
      </div>

      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="studio-credit-actions"
        aria-label="About this project and the studio that built it"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span aria-hidden="true" className={styles.dot} />
        <span className={styles.labelFull}>Concept project · Jedsada Studio</span>
        <span className={styles.labelShort}>Jedsada Studio</span>
        <span aria-hidden="true" className={styles.caret}>
          ▲
        </span>
      </button>
    </div>
  );
}
