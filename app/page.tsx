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
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
      const filePath = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}-${safeName}`;

      const { error } = await supabase.storage
        .from("quote-photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error.message);
        continue;
      }

      const { data } = supabase.storage
        .from("quote-photos")
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl);
      }
    }

    return uploadedUrls;
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

      if (error) throw error;

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
      setSubmitMessage("Something went wrong while sending the quote.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.background} />
      <div className={styles.overlay} />

      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div className={styles.brandWrap}>
            <div className={styles.brandCard}>
            <img
  src="/branding/site-logo.png"
  alt="ArtiPoxi logo"
  className={styles.logoImage}
/>
            </div>

            <div className={styles.brandText}>
              <p className={styles.brandTop}>ARTIPOXI</p>
              <p className={styles.brandSub}>Premium epoxy floor systems</p>
            </div>
          </div>

          <nav className={styles.topNav}>
            <a href="#quote" className={styles.topLinkPrimary}>
              Quote Request
            </a>
            <a href="#finishes" className={styles.topLink}>
              Finishes
            </a>
            <a href="#before-after" className={styles.topLink}>
              Before &amp; After
            </a>
            <Link href="/login" className={styles.topLinkGhost}>
              Login
            </Link>
          </nav>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <p className={styles.eyebrow}>PREMIUM SURFACES</p>

            <h1 className={styles.title}>
              Premium epoxy floors.
              <br />
              Built clean.
              <br />
              Built strong.
            </h1>

            <p className={styles.subtitle}>
              ArtiPoxi creates premium epoxy systems for garages, shops, patios,
              and custom spaces with luxury appearance, durable protection, and
              real-world performance.
            </p>

            <div className={styles.heroActions}>
              <a href="#quote" className={styles.heroPrimary}>
                Request Quote
              </a>
              <a href="#finishes" className={styles.heroSecondary}>
                View Finishes
              </a>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatLabel}>Systems</span>
                <strong className={styles.heroStatValue}>Resin • Flake • Solid</strong>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatLabel}>Best For</span>
                <strong className={styles.heroStatValue}>Garage • Shop • Patio</strong>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatLabel}>Look</span>
                <strong className={styles.heroStatValue}>Luxury finish</strong>
              </div>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.featureCardLarge}>
              <p className={styles.cardLabel}>POPULAR SYSTEM</p>
              <h3 className={styles.cardTitle}>Luxury Resin Garage Finish</h3>
              <p className={styles.cardText}>
                Deep color, strong reflection, and a premium high-end look for
                customers who want a finished space that stands out.
              </p>
            </div>

            <div className={styles.featureCardRow}>
              <div className={styles.featureCardSmall}>
                <p className={styles.cardLabel}>DURABILITY</p>
                <h4 className={styles.cardMiniTitle}>Contractor Grade</h4>
              </div>

              <div className={styles.featureCardSmall}>
                <p className={styles.cardLabel}>MAINTENANCE</p>
                <h4 className={styles.cardMiniTitle}>Easy to clean</h4>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.infoGrid}>
          <article className={styles.infoCard}>
            <span className={styles.infoLabel}>Finish</span>
            <strong className={styles.infoValue}>Luxury Resin</strong>
            <span className={styles.infoDetail}>Deep color and reflection</span>
          </article>

          <article className={styles.infoCard}>
            <span className={styles.infoLabel}>Protection</span>
            <strong className={styles.infoValue}>Built to Last</strong>
            <span className={styles.infoDetail}>Made for daily use</span>
          </article>

          <article className={styles.infoCard}>
            <span className={styles.infoLabel}>Spaces</span>
            <strong className={styles.infoValue}>Garage + Shop + Patio</strong>
            <span className={styles.infoDetail}>Residential and light commercial</span>
          </article>

          <article className={styles.infoCard}>
            <span className={styles.infoLabel}>Next Step</span>
            <strong className={styles.infoValue}>Request a Quote</strong>
            <span className={styles.infoDetail}>Send details and photos</span>
          </article>
        </section>

        <section id="finishes" className={styles.section}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionEyebrow}>FINISH OPTIONS</p>
            <h2 className={styles.sectionTitle}>Choose the look that fits your space</h2>
            <p className={styles.sectionText}>
              From clean broadcast flake to rich metallic movement, we build
              systems that balance appearance, durability, and easy maintenance.
            </p>
          </div>

          <div className={styles.cardGrid}>
            <div className={styles.panel}>
              <p className={styles.panelTag}>POPULAR</p>
              <h3 className={styles.panelTitle}>Flake Finish</h3>
              <p className={styles.panelText}>
                Durable, clean, and ideal for garages and high-traffic spaces
                with a classic broadcast flake appearance.
              </p>
            </div>

            <div className={styles.panel}>
              <p className={styles.panelTag}>PREMIUM</p>
              <h3 className={styles.panelTitle}>Metallic Resin</h3>
              <p className={styles.panelText}>
                Rich movement and custom depth for customers wanting a more
                dramatic, high-end decorative finish.
              </p>
            </div>

            <div className={styles.panel}>
              <p className={styles.panelTag}>CLEAN LOOK</p>
              <h3 className={styles.panelTitle}>Solid Color Epoxy</h3>
              <p className={styles.panelText}>
                Modern, practical, and sleek with a uniform appearance and strong
                protection for everyday use.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.splitSection}>
          <div className={styles.panelLarge}>
            <p className={styles.panelTag}>WHY CUSTOMERS CHOOSE EPOXY</p>
            <h3 className={styles.panelTitle}>Cleaner look. Easier maintenance. Stronger finish.</h3>
            <p className={styles.panelText}>
              Epoxy transforms dull concrete into a cleaner, brighter, more
              professional surface that is easier to maintain and built for
              real use.
            </p>

            <div className={styles.checkList}>
              <div className={styles.checkRow}>
                <span>Cleaner overall appearance</span>
                <span className={styles.checkIcon}>✔</span>
              </div>
              <div className={styles.checkRow}>
                <span>Easier maintenance and wash-down</span>
                <span className={styles.checkIcon}>✔</span>
              </div>
              <div className={styles.checkRow}>
                <span>Long-term concrete protection</span>
                <span className={styles.checkIcon}>✔</span>
              </div>
              <div className={styles.checkRow}>
                <span>Custom finish options</span>
                <span className={styles.checkIcon}>✔</span>
              </div>
            </div>
          </div>

          <div className={styles.panelLarge}>
            <p className={styles.panelTag}>BEFORE &amp; AFTER</p>
            <h3 className={styles.panelTitle}>A better looking space</h3>
            <p className={styles.panelText}>
              Bare concrete, staining, old coating failure, and worn surfaces can
              all be transformed into a finished floor with cleaner appearance,
              stronger protection, and easier upkeep.
            </p>

            <div className={styles.beforeAfterGrid}>
              <div className={styles.beforeAfterCard}>
                <span className={styles.beforeAfterLabel}>Before</span>
                <strong className={styles.beforeAfterTitle}>Worn concrete</strong>
                <p className={styles.beforeAfterText}>
                  Stains, tire marks, old coatings, cracks, and a dull unfinished look.
                </p>
              </div>

              <div className={styles.beforeAfterCard}>
                <span className={styles.beforeAfterLabel}>After</span>
                <strong className={styles.beforeAfterTitle}>Finished surface</strong>
                <p className={styles.beforeAfterText}>
                  Cleaner appearance, stronger protection, easier maintenance, and a
                  premium custom result.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="quote" className={styles.quoteSection}>
          <div className={styles.quoteIntro}>
            <p className={styles.sectionEyebrow}>QUOTE REQUEST</p>
            <h2 className={styles.sectionTitle}>Tell us about your project</h2>
            <p className={styles.sectionText}>
              Share your project details, square footage, and photos so we can
              review your space and follow up with the right options.
            </p>
          </div>

          <div className={styles.quoteWrap}>
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

              <div className={styles.uploadBlock}>
                <label htmlFor="quote-photos" className={styles.uploadLabel}>
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
                  <div className={styles.filePills}>
                    {selectedFiles.map((file) => (
                      <span
                        key={`${file.name}-${file.size}`}
                        className={styles.filePill}
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
                  className={
                    submitMessage.includes("success")
                      ? styles.successMessage
                      : styles.errorMessage
                  }
                >
                  {submitMessage}
                </p>
              ) : null}
            </form>

            <div className={styles.quoteSideCard}>
              <p className={styles.panelTag}>WHAT TO SEND</p>
              <h3 className={styles.panelTitle}>Help us quote faster</h3>
              <p className={styles.panelText}>
                The more detail you send, the better and faster we can review
                your project.
              </p>

              <div className={styles.checkList}>
                <div className={styles.checkRow}>
                  <span>Project location</span>
                  <span className={styles.checkIcon}>✔</span>
                </div>
                <div className={styles.checkRow}>
                  <span>Approximate square footage</span>
                  <span className={styles.checkIcon}>✔</span>
                </div>
                <div className={styles.checkRow}>
                  <span>Garage, patio, shop, or commercial type</span>
                  <span className={styles.checkIcon}>✔</span>
                </div>
                <div className={styles.checkRow}>
                  <span>Photos of the current floor</span>
                  <span className={styles.checkIcon}>✔</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
