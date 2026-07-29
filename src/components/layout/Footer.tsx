import Link from "next/link";
import { navigationLinks, site } from "@/content/site";
import styles from "./Footer.module.css";

export function Footer() {
  const year = "2025";

  return (
    <footer className={styles.footer} data-surface="dark">
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <p className={styles.wordmark}>
              <span>{site.wordmark[0]}</span>
              <span className={styles.wordmarkSecondary}>
                {site.wordmark[1]}
              </span>
            </p>
            <p className={styles.tagline}>{site.tagline}</p>
          </div>

          <nav className={styles.nav} aria-label="Footer">
            <p className={styles.columnTitle}>The house</p>
            <ul role="list" className={styles.navList}>
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link className={styles.navLink} href={`/${link.href}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link className={styles.navLink} href="/journal">
                  All journal entries
                </Link>
              </li>
            </ul>
          </nav>

          <div className={styles.contact}>
            <p className={styles.columnTitle}>Enquiries</p>
            {/* Fictional details. Rendered as plain text, not as mailto/tel
                links, so nobody can accidentally contact a real address. */}
            <ul role="list" className={styles.contactList}>
              <li>{site.contact.address}</li>
              <li>{site.contact.email}</li>
              <li>{site.contact.phone}</li>
            </ul>
            <p className={styles.fictionalNote}>Fictional contact details</p>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.disclaimer}>{site.disclaimer}</p>
          <p className={styles.credit}>
            <span>
              {year} — A concept project by {site.studio}
            </span>
            <span className={styles.coordinates}>
              {site.location.coordinatesLabel}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
