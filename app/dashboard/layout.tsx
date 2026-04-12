"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentProfile, type Profile } from "../lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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
        <div style={shellStyle}>
          <aside style={sidebarStyle}>
            <Sidebar pathname={pathname} />
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
      <div style={shellStyle}>
        <aside style={sidebarStyle}>
          <Sidebar pathname={pathname} />
        </aside>

        <section style={contentStyle}>
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

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <>
      <div style={brandWrapStyle}>
        <div style={brandLogoStyle}>AP</div>
        <div>
          <div style={brandTopStyle}>ARTIPOXI</div>
          <div style={brandBottomStyle}>Operations</div>
        </div>
      </div>

      <div style={navStackStyle}>
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
  display: "grid",
  gridTemplateColumns: "300px 1fr",
};

const sidebarStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "24px 20px",
  borderRight: "1px solid rgba(255,255,255,0.08)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
  backdropFilter: "blur(14px)",
};

const contentStyle: React.CSSProperties = {
  minWidth: 0,
  padding: "24px",
  background:
    "radial-gradient(circle at top left, rgba(0, 183, 255, 0.08), transparent 20%), radial-gradient(circle at right center, rgba(0, 140, 255, 0.06), transparent 24%)",
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

const navItemStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "white",
  padding: "16px 18px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(14px)",
  fontWeight: 700,
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
};

const loadingCardStyle: React.CSSProperties = {
  borderRadius: "22px",
  padding: "20px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
};
