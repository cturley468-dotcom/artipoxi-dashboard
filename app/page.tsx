"use client";

import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div className={styles.brandCard}>
            <div className={styles.logo}>AP</div>
            <div>
              <p className={styles.brandTop}>ARTIPOXI</p>
              <h2 className={styles.brandBottom}>Operations</h2>
            </div>
          </div>

          <nav className={styles.topNav}>
            <a href="#quote" className={styles.topLink}>
              Quote Request
            </a>
            <a href="#finishes" className={styles.topLink}>
              Finishes
            </a>
            <a href="#before-after" className={styles.topLink}>
              Before &amp; After
            </a>
            <Link href="/login" className={styles.topLinkActive}>
              Login
            </Link>
          </nav>
        </header>

        <section className={styles.heroPanel}>
          <div className={styles.heroPanelLeft}>
            <p className={styles.eyebrow}>PREMIUM SURFACES</p>

            <h1 className={styles.title}>
              Premium floors.
              <br />
              Contractor strong.
              <br />
              Built to last.
            </h1>

            <p className={styles.subtitle}>
              ArtiPoxi creates premium epoxy systems for garages, shops, patios,
              and custom spaces with a clean luxury finish and real-world durability.
            </p>

            <div className={styles.heroActions}>
              <a href="#quote" className={styles.heroPrimary}>
                Request Quote
              </a>
              <a href="#finishes" className={styles.heroGhost}>
                View Finishes
              </a>
            </div>
          </div>

          <div className={styles.heroPanelRight}>
            <div className={styles.heroMiniCard}>
              <span className={styles.heroMiniLabel}>Popular System</span>
              <strong className={styles.heroMiniValue}>Luxury Resin Garage Finish</strong>
            </div>

            <div className={styles.heroMiniCard}>
              <span className={styles.heroMiniLabel}>Best For</span>
              <strong className={styles.heroMiniValue}>Garage, Shop, Patio</strong>
            </div>
          </div>
        </section>

        <section className={styles.statsGrid}>
          <article className={styles.statCard}>
            <span className={styles.statLabel}>Finish</span>
            <strong className={styles.statValue}>Luxury Resin</strong>
            <span className={styles.statDetail}>Deep color and reflection</span>
          </article>

          <article className={styles.statCard}>
            <span className={styles.statLabel}>Durability</span>
            <strong className={styles.statValue}>Contractor Grade</strong>
            <span className={styles.statDetail}>Built for daily use</span>
          </article>

          <article className={styles.statCard}>
            <span className={styles.statLabel}>Use Case</span>
            <strong className={styles.statValue}>Garage + Shop</strong>
            <span className={styles.statDetail}>Residential and light commercial</span>
          </article>

          <article className={styles.statCard}>
            <span className={styles.statLabel}>Next Step</span>
            <strong className={styles.statValue}>Request a Quote</strong>
            <span className={styles.statDetail}>Tell us your square footage</span>
          </article>
        </section>

        <section id="quote" className={styles.contentGrid}>
          <div className={styles.panelLarge}>
            <p className={styles.panelTag}>QUOTE REQUEST</p>
            <h3 className={styles.panelTitle}>Tell us about your project</h3>
            <p className={styles.panelText}>
              Share your project details and approximate square footage so we can
              review the space and follow up with the right options.
            </p>

            <form className={styles.quoteForm}>
              <div className={styles.formGrid}>
                <input className={styles.input} type="text" placeholder="Full Name" />
                <input className={styles.input} type="tel" placeholder="Phone Number" />
                <input className={styles.input} type="email" placeholder="Email Address" />
                <input className={styles.input} type="text" placeholder="City / Project Location" />
                <input className={styles.input} type="number" placeholder="Approx. Square Footage" />
                <select className={styles.input} defaultValue="">
                  <option value="" disabled>
                    Project Type
                  </option>
                  <option>Garage</option>
                  <option>Shop</option>
                  <option>Patio</option>
                  <option>Commercial</option>
                  <option>Other</option>
                </select>
              </div>

              <textarea
                className={styles.textarea}
                placeholder="Tell us about your floor, preferred finish, timeline, or anything else we should know."
              />

              <div className={styles.formActions}>
                <button type="button" className={styles.primaryBtn}>
                  Submit Request
                </button>
                <Link href="/login" className={styles.secondaryBtn}>
                  Employee Login
                </Link>
              </div>
            </form>
          </div>

          <div className={styles.panel}>
            <p className={styles.panelTag}>WHY CUSTOMERS CHOOSE EPOXY</p>
            <h3 className={styles.panelTitle}>Clean, strong, and built to last</h3>

            <div className={styles.pipelineList}>
              <div className={styles.pipelineRow}>
                <span>Cleaner Look</span>
                <span className={styles.pipelineCount}>✔</span>
              </div>
              <div className={styles.pipelineRow}>
                <span>Easier Maintenance</span>
                <span className={styles.pipelineCount}>✔</span>
              </div>
              <div className={styles.pipelineRow}>
                <span>Long-Term Protection</span>
                <span className={styles.pipelineCount}>✔</span>
              </div>
              <div className={styles.pipelineRow}>
                <span>Custom Finish Options</span>
                <span className={styles.pipelineCount}>✔</span>
              </div>
            </div>
          </div>
        </section>

        <section id="finishes" className={styles.bottomGrid}>
          <div className={styles.panel}>
            <p className={styles.panelTag}>FINISH OPTIONS</p>
            <h3 className={styles.panelTitle}>Flake Finish</h3>
            <p className={styles.panelText}>
              Durable, clean, and ideal for garages and high-traffic spaces with
              a classic broadcast flake appearance.
            </p>
          </div>

          <div className={styles.panel}>
            <p className={styles.panelTag}>FINISH OPTIONS</p>
            <h3 className={styles.panelTitle}>Metallic Resin</h3>
            <p className={styles.panelText}>
              Rich movement and custom depth for customers wanting a higher-end decorative finish.
            </p>
          </div>

          <div className={styles.panel}>
            <p className={styles.panelTag}>FINISH OPTIONS</p>
            <h3 className={styles.panelTitle}>Solid Color Epoxy</h3>
            <p className={styles.panelText}>
              Clean, modern, and practical with a sleek uniform appearance and strong protection.
            </p>
          </div>
        </section>

        <section id="before-after" className={styles.bottomGrid}>
          <div className={styles.panel}>
            <p className={styles.panelTag}>BEFORE</p>
            <h3 className={styles.panelTitle}>Worn concrete</h3>
            <p className={styles.panelText}>
              Bare concrete, stains, old coating failure, tire marks, cracks,
              and a dull unfinished look.
            </p>
          </div>

          <div className={styles.panel}>
            <p className={styles.panelTag}>AFTER</p>
            <h3 className={styles.panelTitle}>Finished surface</h3>
            <p className={styles.panelText}>
              Cleaner appearance, stronger protection, easier maintenance,
              and a premium custom result.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
