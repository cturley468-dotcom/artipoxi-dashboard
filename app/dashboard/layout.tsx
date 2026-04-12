"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentProfile, type Profile } from "../lib/auth";
import styles from "./page.module.css";
import { supabase } from "../lib/supabase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 900);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const currentProfile = await getCurrentProfile();

      if (!mounted) return;

      if (!currentProfile) {
        router.replace("/login");
        return;
      }

      setProfile(currentProfile);
      setLoading(false);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <main style={pageStyle}>
        <div
          style={{
            ...shellStyle,
            ...(isMobile ? shellMobileStyle : shellDesktopStyle),
          }}
        >
          <aside
            style={{
              ...sidebarStyle,
              ...(isMobile ? sidebarMobileStyle : sidebarDesktopStyle),
            }}
          >
            <Sidebar pathname={pathname} isMobile={isMobile} />
          </aside>

          <section style={contentStyle}>
            <div style={loadingCardStyle}>Loading...</div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div
        style={{
          ...shellStyle,
          ...(isMobile ? shellMobileStyle : shellDesktopStyle),
        }}
      >
        <aside
          style={{
            ...sidebarStyle,
            ...(isMobile ? sidebarMobileStyle : sidebarDesktopStyle),
          }}
        >
          <Sidebar pathname={pathname} isMobile={isMobile} />
        </aside>

        <section
          style={{
            ...contentStyle,
            ...(isMobile ? contentMobileStyle : null),
          }}
        >
          {profile ? (
            <div style={signedInWrapStyle}>
              <span style={signedInTextStyle}>
                Signed in as {profile.email ?? "user"}
              </span>
            </div>
          ) : null}

          {children}
        </section>
      </div>
    </main>
  );
}

function Sidebar({
  pathname,
  isMobile,
}: {
  pathname: string;
  isMobile: boolean;
}) {
  return (
    <>
      <div className={styles.brandWrap}>
  <img
    src="/branding/ap-logo.png"
    alt="ArtiPoxi logo"
    className={styles.brandLogoImage}
  />
  <div className={styles.brandText}>
    <p className={styles.brandTop}>ARTIPOXI</p>
    <h2 className={styles.brandBottom}>Operations</h2>
  </div>
</div>

<div className={styles.logoutWrap}>
  <button
    type="button"
    className={styles.logoutButton}
    onClick={async () => {
      await supabase.auth.signOut();
      window.location.href = "/login";
    }}
  >
    Logout
  </button>
</div>

      <div
        style={{
          ...navStackStyle,
          ...(isMobile ? navStackMobileStyle : null),
        }}
      >
        <NavItem href="/" label="Home" pathname={pathname} exact />
        <NavItem href="/dashboard" label="Dashboard" pathname={pathname} exact />
        <NavItem href="/dashboard/jobs" label="Jobs" pathname={pathname} />
        <NavItem href="/dashboard/leads" label="Leads" pathname={pathname} />
        <NavItem href="/dashboard/schedule" label="Schedule" pathname={pathname} />
        <NavItem href="/dashboard/quotes" label="Quotes" pathname={pathname} />
        <NavItem href="/configurator" label="Configurator" pathname={pathname} />
        <NavItem href="/dashboard/finance" label="Finance" pathname={pathname} />
        <NavItem href="/dashboard/inventory" label="Inventory" pathname={pathname} />
      </div>
    </>
  );
}

function NavItem({
  href,
  label,
  pathname,
  exact = false,
}: {
  href: string;
  label: string;
  pathname: string;
  exact?: boolean;
}) {
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      style={{
        ...navItemStyle,
        ...(active ? navItemActiveStyle : null),
      }}
    >
      {label}
    </Link>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "linear-gradient(rgba(2, 6, 17, 0.48), rgba(2, 5, 12, 0.72)), url('/backgrounds/dashboard-epoxy.png')",
  backgroundSize: "cover",
  backgroundPosition: "center center",
  backgroundRepeat: "no-repeat",
  color: "white",
};

const shellStyle: React.CSSProperties = {
  minHeight: "100vh",
};

const shellDesktopStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "300px 1fr",
};

const shellMobileStyle: React.CSSProperties = {
  display: "block",
};

const sidebarStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
  backdropFilter: "blur(14px)",
};

const sidebarDesktopStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "24px 20px",
  borderRight: "1px solid rgba(255,255,255,0.08)",
};

const sidebarMobileStyle: React.CSSProperties = {
  padding: "20px 16px 12px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const contentStyle: React.CSSProperties = {
  minWidth: 0,
  padding: "24px",
  background:
    "radial-gradient(circle at top left, rgba(0, 183, 255, 0.08), transparent 20%), radial-gradient(circle at right center, rgba(0, 140, 255, 0.06), transparent 24%)",
};

const contentMobileStyle: React.CSSProperties = {
  padding: "16px",
};

const brandWrapStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "24px",
};

const brandLogoStyle: React.CSSProperties = {
  width: "54px",
  height: "54px",
  borderRadius: "16px",
  display: "grid",
  placeItems: "center",
  fontWeight: 700,
  fontSize: "1.4rem",
  background: "rgba(255, 255, 255, 0.06)",
  border: "1px solid rgba(0, 212, 255, 0.24)",
};

const brandTopStyle: React.CSSProperties = {
  fontSize: "0.76rem",
  letterSpacing: "0.2em",
  color: "rgba(216, 240, 255, 0.68)",
};

const brandBottomStyle: React.CSSProperties = {
  marginTop: "4px",
  fontSize: "1.7rem",
  lineHeight: 1.05,
  fontWeight: 700,
};

const navStackStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
};

const navStackMobileStyle: React.CSSProperties = {
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "10px",
};

const navItemStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "white",
  padding: "16px 18px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(14px)",
  fontWeight: 700,
  textAlign: "left",
};

const navItemActiveStyle: React.CSSProperties = {
  borderColor: "rgba(0, 212, 255, 0.32)",
  background: "rgba(0, 212, 255, 0.1)",
  boxShadow: "0 8px 20px rgba(0, 212, 255, 0.08)",
};

const signedInWrapStyle: React.CSSProperties = {
  marginBottom: "14px",
};

const signedInTextStyle: React.CSSProperties = {
  color: "#9fe8ff",
  fontWeight: 600,
  overflowWrap: "anywhere",
};

const loadingCardStyle: React.CSSProperties = {
  borderRadius: "22px",
  padding: "20px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
};
