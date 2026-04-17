"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentProfile, type Profile } from "../lib/auth";
import { supabase } from "../lib/supabase";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);

      if (!mobile) {
        setMenuOpen(false);
      }
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
            <Sidebar
              pathname={pathname}
              isMobile={isMobile}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              onLogout={handleLogout}
            />
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
          <Sidebar
            pathname={pathname}
            isMobile={isMobile}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            onLogout={handleLogout}
          />
        </aside>

        <section
          style={{
            ...contentStyle,
            ...(isMobile ? contentMobileStyle : null),
          }}
        >
          {profile && !isMobile ? (
            <div style={signedInWrapStyle}>
              <span style={signedInTextStyle}>
                Signed in as {profile.full_name ?? profile.email ?? "user"}
              </span>

              <button onClick={handleLogout} style={logoutInlineButtonStyle}>
                Logout
              </button>
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
  menuOpen,
  setMenuOpen,
  onLogout,
}: {
  pathname: string;
  isMobile: boolean;
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout: () => void | Promise<void>;
}) {
  function closeMenu() {
    setMenuOpen(false);
  }

  const navContent = (
    <>
      <div
        style={{
          ...navStackStyle,
          ...(isMobile ? navStackMobileStyle : null),
        }}
      >
        <NavItem
          href="/"
          label="Home"
          pathname={pathname}
          exact
          onNavigate={closeMenu}
        />
        <NavItem
          href="/dashboard"
          label="Dashboard"
          pathname={pathname}
          exact
          onNavigate={closeMenu}
        />
        <NavItem
          href="/dashboard/jobs"
          label="Jobs"
          pathname={pathname}
          onNavigate={closeMenu}
        />
        <NavItem
          href="/dashboard/leads"
          label="Leads"
          pathname={pathname}
          onNavigate={closeMenu}
        />
        <NavItem
          href="/dashboard/schedule"
          label="Schedule"
          pathname={pathname}
          onNavigate={closeMenu}
        />
        <NavItem
          href="/dashboard/quotes"
          label="Quotes"
          pathname={pathname}
          onNavigate={closeMenu}
        />
        <NavItem
          href="/configurator"
          label="Configurator"
          pathname={pathname}
          onNavigate={closeMenu}
        />
        <NavItem
          href="/dashboard/finance"
          label="Finance"
          pathname={pathname}
          onNavigate={closeMenu}
        />
        <NavItem
          href="/dashboard/inventory"
          label="Inventory"
          pathname={pathname}
          onNavigate={closeMenu}
        />
      </div>

      {isMobile ? (
        <button
          onClick={onLogout}
          style={{
            ...mobileLogoutButtonStyle,
            marginTop: "12px",
          }}
        >
          Logout
        </button>
      ) : null}
    </>
  );

  return (
    <>
      <div style={brandWrapStyle}>
        <img
          src="/branding/site-logo.png"
          alt="ArtiPoxi logo"
          style={brandImageStyle}
        />
        <div>
          <div style={brandTopStyle}>ARTIPOXI</div>
          <div style={brandBottomStyle}>Operations</div>
        </div>
      </div>

      {isMobile ? (
        <div style={mobileMenuWrapStyle}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-label="Toggle dashboard menu"
            style={mobileMenuButtonStyle}
          >
            {menuOpen ? "Close Menu" : "Menu"}
          </button>

          {menuOpen ? <div style={mobileMenuPanelStyle}>{navContent}</div> : null}
        </div>
      ) : (
        navContent
      )}
    </>
  );
}

function NavItem({
  href,
  label,
  pathname,
  exact = false,
  onNavigate,
}: {
  href: string;
  label: string;
  pathname: string;
  exact?: boolean;
  onNavigate?: () => void;
}) {
  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
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
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
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

const brandImageStyle: React.CSSProperties = {
  width: "64px",
  height: "64px",
  objectFit: "cover",
  borderRadius: "18px",
  display: "block",
  flexShrink: 0,
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

const mobileMenuWrapStyle: React.CSSProperties = {
  width: "100%",
};

const mobileMenuButtonStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "52px",
  padding: "12px 16px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  fontWeight: 700,
  fontSize: "16px",
  cursor: "pointer",
  backdropFilter: "blur(14px)",
};

const mobileMenuPanelStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
  marginTop: "12px",
  padding: "14px",
  borderRadius: "22px",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
};

const navStackStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
};

const navStackMobileStyle: React.CSSProperties = {
  gridTemplateColumns: "1fr 1fr",
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
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "14px",
  flexWrap: "nowrap",
};

const signedInTextStyle: React.CSSProperties = {
  color: "#9fe8ff",
  fontWeight: 700,
  fontSize: "16px",
  lineHeight: 1.2,
};

const logoutInlineButtonStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.15)",
  cursor: "pointer",
  flexShrink: 0,
};

const mobileLogoutButtonStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "52px",
  padding: "12px 16px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  fontWeight: 700,
  fontSize: "16px",
  cursor: "pointer",
};

const loadingCardStyle: React.CSSProperties = {
  borderRadius: "22px",
  padding: "20px",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
};
