import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.overlay} />

        <header className={styles.header}>
          <div className={styles.logoWrap}>
            <div className={styles.logoBox}>AP</div>
            <div>
              <p className={styles.brandTop}>ArtiPoxi</p>
              <h2 className={styles.brandBottom}>Premium Epoxy Systems</h2>
            </div>
          </div>

          <nav className={styles.nav}>
            <button className={styles.navBtn}>Home</button>
            <button className={styles.navBtn}>Projects</button>
            <button className={styles.navBtn}>Services</button>
            <button className={styles.navBtn}>Contact</button>
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
              <button className={styles.primaryBtn}>View Projects</button>
              <button className={styles.secondaryBtn}>Start Your Quote</button>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.featureCard}>
              <span className={styles.featureTag}>Featured System</span>
              <h3 className={styles.featureTitle}>Black Resin Garage Finish</h3>
              <p className={styles.featureText}>
                Deep resin movement, strong contrast, and a premium modern finish
                that feels custom without losing durability.
              </p>
              <button className={styles.cardBtn}>See Details</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
