'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';

type BackgroundOption = {
  id: string;
  label: string;
  type: 'image' | 'gradient';
  value: string;
};

const backgroundOptions: BackgroundOption[] = [
  {
    id: 'resin-blue',
    label: 'Deep Resin Blue',
    type: 'image',
    value: '/backgrounds/artipoxi-blue-resin.jpg',
  },
  {
    id: 'dark-luxury',
    label: 'Dark Luxury',
    type: 'image',
    value: '/backgrounds/dark-luxury-texture.jpg',
  },
  {
    id: 'blue-glow',
    label: 'Blue Glow Gradient',
    type: 'gradient',
    value:
      'radial-gradient(circle at 20% 20%, rgba(0, 180, 255, 0.16), transparent 25%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.06), transparent 18%), linear-gradient(180deg, #030712 0%, #071120 45%, #02050c 100%)',
  },
];

const featuredProducts = [
  {
    id: 1,
    name: 'Ocean Resin Cross',
    description: 'Deep ocean blue resin with natural wood grain and a luxury handcrafted finish.',
    tag: 'Featured',
  },
  {
    id: 2,
    name: 'Epoxy Jewelry',
    description: 'Wearable art inspired by nature, resin flow, and rich organic textures.',
    tag: 'Popular',
  },
  {
    id: 3,
    name: 'Custom Art Pieces',
    description: 'One-of-a-kind resin and wood creations designed around your vision.',
    tag: 'Custom',
  },
];

export default function HomePage() {
  const [selectedBgId, setSelectedBgId] = useState('blue-glow');
  const [showBgEditor, setShowBgEditor] = useState(false);

  useEffect(() => {
    const savedBg = localStorage.getItem('artipoxi-home-bg');
    if (savedBg) setSelectedBgId(savedBg);
  }, []);

  useEffect(() => {
    localStorage.setItem('artipoxi-home-bg', selectedBgId);
  }, [selectedBgId]);

  const selectedBg =
    backgroundOptions.find((bg) => bg.id === selectedBgId) ?? backgroundOptions[0];

  const heroStyle = useMemo(() => {
    if (selectedBg.type === 'image') {
      return {
        backgroundImage: `
          linear-gradient(180deg, rgba(2, 5, 12, 0.56) 0%, rgba(3, 7, 15, 0.74) 45%, rgba(2, 4, 10, 0.94) 100%),
          url(${selectedBg.value})
        `,
      };
    }

    return {
      backgroundImage: selectedBg.value,
    };
  }, [selectedBg]);

  return (
    <main className={styles.page}>
      <section className={styles.hero} style={heroStyle}>
        <div className={styles.overlayGlow} />
        <div className={styles.overlayGrid} />

        <header className={styles.header}>
          <div className={styles.brand}>
            <div className={styles.logo}>A</div>

            <div>
              <p className={styles.brandLabel}>ARTIPOXI</p>
              <h2 className={styles.brandTitle}>The Art of Nature, Reinvented</h2>
            </div>
          </div>

          <nav className={styles.nav}>
            <button className={styles.navBtn}>Home</button>
            <button className={styles.navBtn}>Shop</button>
            <button className={styles.navBtn}>Collections</button>
            <button className={styles.navBtn}>Custom</button>
            <button className={styles.navBtn}>About</button>
          </nav>
        </header>

        <div className={styles.heroContent}>
          <div className={styles.left}>
            <p className={styles.eyebrow}>HANDCRAFTED EPOXY ART</p>

            <h1 className={styles.heading}>
              Nature-inspired resin art
              <span className={styles.headingAccent}> crafted with a luxury modern edge.</span>
            </h1>

            <p className={styles.subtext}>
              Discover handcrafted epoxy creations designed to blend natural wood,
              deep color, premium detail, and bold visual presence.
            </p>

            <div className={styles.buttonRow}>
              <button className={styles.primaryBtn}>Explore Collection</button>
              <button className={styles.secondaryBtn}>View Featured</button>
            </div>

            <div className={styles.statRow}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Material</span>
                <span className={styles.statValue}>Wood + Resin</span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>Style</span>
                <span className={styles.statValue}>Luxury Modern</span>
              </div>

              <div className={styles.statCard}>
                <span className={styles.statLabel}>Finish</span>
                <span className={styles.statValue}>Handcrafted</span>
              </div>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.showcaseCard}>
              <div className={styles.showcaseTop}>
                <span className={styles.showcaseBadge}>Featured Piece</span>
              </div>

              <div className={styles.showcaseImageArea}>
                <div className={styles.showcaseGlow} />
                <div className={styles.showcaseMock}>ART DISPLAY</div>
              </div>

              <div className={styles.showcaseBottom}>
                <h3 className={styles.showcaseTitle}>Ocean Resin Cross</h3>
                <p className={styles.showcaseText}>
                  A bold resin-and-wood statement piece with deep ocean tones and a
                  premium display look.
                </p>

                <button className={styles.cardBtn}>Shop This Piece</button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.editorSection}>
          <button
            className={styles.editorToggle}
            onClick={() => setShowBgEditor((prev) => !prev)}
          >
            {showBgEditor ? 'Close Background Options' : 'Edit Homepage Background'}
          </button>

          {showBgEditor && (
            <div className={styles.bgEditor}>
              <div className={styles.editorHeader}>
                <h3>Background Options</h3>
                <p>Select the homepage background style.</p>
              </div>

              <div className={styles.bgGrid}>
                {backgroundOptions.map((bg) => (
                  <button
                    key={bg.id}
                    className={`${styles.bgChoice} ${
                      selectedBgId === bg.id ? styles.bgChoiceActive : ''
                    }`}
                    onClick={() => setSelectedBgId(bg.id)}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <p className={styles.sectionEyebrow}>CURATED COLLECTIONS</p>
          <h2 className={styles.sectionTitle}>Featured categories</h2>
          <p className={styles.sectionText}>
            Explore handcrafted pieces designed to feel bold, artistic, and premium.
          </p>
        </div>

        <div className={styles.cardGrid}>
          {featuredProducts.map((item) => (
            <article key={item.id} className={styles.productCard}>
              <span className={styles.productTag}>{item.tag}</span>
              <h3 className={styles.productTitle}>{item.name}</h3>
              <p className={styles.productDescription}>{item.description}</p>
              <button className={styles.productBtn}>View More</button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}