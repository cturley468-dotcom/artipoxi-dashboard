import Link from "next/link";
import styles from "./page.module.css";

export default function ConfiguratorPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>SYSTEM BUILDER</p>
        <h1 className={styles.title}>Configurator</h1>
        <p className={styles.text}>
          This is your configurator starting page. Next, we can turn this into a real
          step-by-step epoxy system builder.
        </p>

        <div className={styles.actions}>
          <Link href="/dashboard" className={styles.secondaryBtn}>Dashboard</Link>
          <Link href="/jobs" className={styles.primaryBtn}>Jobs</Link>
        </div>
      </div>
    </main>
  );
}
