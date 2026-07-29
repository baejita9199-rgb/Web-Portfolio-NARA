import Link from "next/link";
import { site } from "@/content/site";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.label}>404</p>
        <h1 className={styles.title}>This path leads nowhere.</h1>
        <p className={styles.body}>
          The page you were looking for is not part of {site.name}. It may have
          been renamed, or it may never have existed.
        </p>
        <Link href="/" className={styles.link}>
          Return to the house
        </Link>
      </div>
    </div>
  );
}
