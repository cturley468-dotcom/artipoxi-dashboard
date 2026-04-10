import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.overlay} />
        <div className={styles.overlayGlow} />

        <header className={styles.header}>
          <div className={styles.logoWrap}>
            <div className={styles.logoBox}>AP</div>

            <div className={styles.brandText}>
              <p className={styles.brandTop}>ARTIPOXI</p>
              <h2 className={styles.brandBottom}>Premium Epoxy Systems</h2>
            </div>
          </div>

          <nav className={styles.nav}>
            <Link href="/" className={styles.navBtn}>Home</Link>
            <Link href="/dashboard" className={styles.navBtn}>Dashboard</Link>
            <Link href="/jobs" className={styles.navBtn}>Jobs</Link>
            <Link href="/configurator" className={styles.navBtn}>Configurator</Link>
            <Link href="/login" className={styles.loginBtn}>Login</Link>
          </nav>
        </header>

        <div className={styles.heroContent}>
          <div className={styles.left}>
            <p className={styles.kicker}>PREMIUM SURFACES</p>

            <h1 className={styles.title}>
              Premium floors.
              <br />
              Contractor strong.
              <br />
              Built to last.
            </h1>

            <p className={styles.subtitle}>
              ArtiPoxi creates premium epoxy systems for garages, shops, and custom
              spaces with a clean luxury finish and real-world durability.
            </p>

            <div className={styles.buttonRow}>
              <Link href="/jobs" className={styles.primaryBtn}>
                View Jobs
              </Link>
              <Link href="/configurator" className={styles.secondaryBtn}>
                Start Configurator
              </Link>
            </div>

            <div className={styles.metricRow}>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Finish</span>
                <span className={styles.metricValue}>Luxury Resin</span>
              </div>

              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Strength</span>
                <span className={styles.metricValue}>Contractor Grade</span>
              </div>

              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Use Case</span>
                <span className={styles.metricValue}>Garage + Shop</span>
              </div>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.featureCard}>
              <div className={styles.featureVisual}>
                <div className={styles.visualGlow} />
                <div className={styles.visualPanel}>
                  <div className={styles.visualBadge}>Featured System</div>
                  <div className={styles.visualLines}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={styles.visualPlate}>BLACK RESIN FINISH</div>
                </div>
              </div>

              <div className={styles.featureInfo}>
                <span className={styles.featureTag}>Premium Coating</span>
                <h3 className={styles.featureTitle}>Black Resin Garage Finish</h3>
                <p className={styles.featureText}>
                  Deep resin movement, strong contrast, and a premium modern finish
                  that feels custom without losing durability.
                </p>

                <div className={styles.featureActions}>
                  <Link href="/configurator" className={styles.cardBtn}>
                    Open Configurator
                  </Link>
                  <Link href="/dashboard" className={styles.cardGhostBtn}>
                    Open Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className={styles.lowerSection}>
          <div className={styles.lowerCard}>
            <p className={styles.lowerTag}>Why ArtiPoxi</p>
            <h3 className={styles.lowerTitle}>Built for real use, not just looks.</h3>
            <p className={styles.lowerText}>
              Premium coatings, clean installation flow, and a stronger customer-facing
              experience from quote to completion.
            </p>
          </div>

          <div className={styles.lowerCard}>
            <p className={styles.lowerTag}>Business Tools</p>
            <h3 className={styles.lowerTitle}>Operations and configurator together.</h3>
            <p className={styles.lowerText}>
              Manage jobs, track workflow, and build system options inside one matching app.
            </p>
          </div>

          <div className={styles.lowerCard}>
            <p className={styles.lowerTag}>Next Step</p>
            <h3 className={styles.lowerTitle}>Start building the customer flow.</h3>
            <p className={styles.lowerText}>
              Next we can connect login, configurator steps, estimates, and real dashboard data.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
