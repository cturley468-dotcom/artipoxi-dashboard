"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "./lib/supabase";
import styles from "./page.module.css";

type QuoteFormState = {
  full_name: string;
  phone: string;
  email: string;
  city: string;
  square_footage: string;
  project_type: string;
  details: string;
};

export default function Home() {
  const [form, setForm] = useState<QuoteFormState>({
    full_name: "",
    phone: "",
    email: "",
    city: "",
    square_footage: "",
    project_type: "",
    details: "",
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  async function uploadQuotePhotos(files: File[]) {
    const uploadedPaths: string[] = [];

    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
      const filePath = `public/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}-${safeName}`;

      const { error } = await supabase.storage
        .from("quote-photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      uploadedPaths.push(filePath);
    }

    return uploadedPaths;
  }

  async function handleQuoteSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage("");

    try {
      const photoUrls =
        selectedFiles.length > 0 ? await uploadQuotePhotos(selectedFiles) : [];

      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim(),
        city: form.city.trim() || null,
        square_footage: form.square_footage
          ? Number(form.square_footage)
          : null,
        project_type: form.project_type.trim() || null,
        details: form.details.trim() || null,
        photo_urls: photoUrls,
      };

      const { error } = await supabase.from("quote_requests").insert([payload]);

      if (error) {
        throw error;
      }

      setSubmitMessage("Quote request sent successfully.");
      setForm({
        full_name: "",
        phone: "",
        email: "",
        city: "",
        square_footage: "",
        project_type: "",
        details: "",
      });
      setSelectedFiles([]);
    } catch (error) {
      console.error(error);
      setSubmitMessage("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

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
              <strong className={styles.heroMiniValue}>
                Luxury Resin Garage Finish
              </strong>
            </div>

            <div className={styles.heroMiniCard}>
              <span className={styles.heroMiniLabel}>Best For</span>
              <strong className={styles.heroMiniValue}>
                Garage, Shop, Patio
              </strong>
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
            <span className={styles.statDetail}>
              Residential and light commercial
            </span>
          </article>

          <article className={styles.statCard}>
            <span className={styles.statLabel}>Next Step</span>
            <strong className={styles.statValue}>Request a Quote</strong>
            <span className={styles.statDetail}>
              Tell us your square footage
            </span>
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

            <form className={styles.quoteForm} onSubmit={handleQuoteSubmit}>
              <div className={styles.formGrid}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Full Name"
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                  required
                />

                <input
                  className={styles.input}
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />

                <input
                  className={styles.input}
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />

                <input
                  className={styles.input}
                  type="text"
                  placeholder="City / Project Location"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />

                <input
                  className={styles.input}
                  type="number"
                  placeholder="Approx. Square Footage"
                  value={form.square_footage}
                  onChange={(e) =>
                    setForm({ ...form, square_footage: e.target.value })
                  }
                />

                <select
                  className={styles.input}
                  value={form.project_type}
                  onChange={(e) =>
                    setForm({ ...form, project_type: e.target.value })
                  }
                  required
                >
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
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
              />

              <div style={{ marginTop: 14 }}>
                <label
                  htmlFor="quote-photos"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: "rgba(231,243,255,0.82)",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Add photos
                </label>

                <input
                  id="quote-photos"
                  className={styles.input}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setSelectedFiles(Array.from(e.target.files ?? []))
                  }
                />

                {selectedFiles.length > 0 ? (
                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {selectedFiles.map((file) => (
                      <span
                        key={`${file.name}-${file.size}`}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "rgba(231,243,255,0.85)",
                          fontSize: 12,
                        }}
                      >
                        {file.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={submitting}
                >
                  {submitting ? "Sending..." : "Submit Request"}
                </button>
              </div>

              {submitMessage ? (
                <p
                  style={{
                    marginTop: 12,
                    color: submitMessage.includes("success")
                      ? "#9fe8ff"
                      : "#ffd3d3",
                  }}
                >
                  {submitMessage}
                </p>
              ) : null}
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
              Rich movement and custom depth for customers wanting a higher-end
              decorative finish.
            </p>
          </div>

          <div className={styles.panel}>
            <p className={styles.panelTag}>FINISH OPTIONS</p>
            <h3 className={styles.panelTitle}>Solid Color Epoxy</h3>
            <p className={styles.panelText}>
              Clean, modern, and practical with a sleek uniform appearance and
              strong protection.
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

          <div className={styles.panel}>
            <p className={styles.panelTag}>RESULT</p>
            <h3 className={styles.panelTitle}>A better looking space</h3>
            <p className={styles.panelText}>
              A finished floor gives your garage, shop, or patio a cleaner,
              brighter, more professional look.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
