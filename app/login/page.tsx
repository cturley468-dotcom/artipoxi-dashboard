import Link from "next/link";
import styles from "./page.module.css";

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>ACCESS PORTAL</p>
        <h1 className={styles.title}>Login</h1>

        <form className={styles.form}>
          <input className={styles.input} type="email" placeholder="Email" />
          <input className={styles.input} type="password" placeholder="Password" />
          <button className={styles.submitBtn} type="submit">
            Sign In
          </button>
        </form>

        <div className={styles.links}>
          <Link href="/" className={styles.linkBtn}>Home</Link>
          <Link href="/dashboard" className={styles.linkBtn}>Dashboard</Link>
        </div>
      </div>
    </main>
  );
}
