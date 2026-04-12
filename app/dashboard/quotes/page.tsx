"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { getCurrentProfile, type Profile } from "../../lib/auth";

type QuoteRequest = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  square_footage: number | null;
  project_type: string | null;
  details: string | null;
  created_at: string;
};

export default function QuotesPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      try {
        const currentProfile = await getCurrentProfile();

        if (!mounted) return;

        if (!currentProfile) {
          router.replace("/login");
          return;
        }

        setProfile(currentProfile);

        const { data, error } = await supabase
          .from("quote_requests")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (!mounted) return;
        setQuotes((data ?? []) as QuoteRequest[]);
      } catch (error) {
        console.error(error);
        if (!mounted) return;
        setErrorMessage("Could not load quote requests.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPage();

    return () => {
      mounted = false;
    };
  }, [router]);

  const filteredQuotes = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return quotes;

    return quotes.filter((quote) =>
      [
        quote.full_name,
        quote.email,
        quote.phone,
        quote.city,
        quote.project_type,
        quote.details,
        quote.square_footage?.toString(),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [quotes, search]);

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={dashboardShellStyle}>
          <aside style={sidebarStyle}>
            <Sidebar />
          </aside>
          <section style={mainStyle}>
            <div style={heroStyle}>
              <div style={heroCardStyle}>Loading quote requests...</div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={dashboardShellStyle}>
        <aside style={sidebarStyle}>
          <Sidebar />
        </aside>

        <section style={mainStyle}>
          <div style={heroStyle}>
            <div>
              <div style={eyebrowStyle}>CUSTOMER REQUESTS</div>
              <h1 style={titleStyle}>Quotes</h1>
              <p style={subtextStyle}>
                Review quote requests submitted from the homepage.
              </p>
            </div>

            <div style={topRightStyle}>
              <div style={summaryCardStyle}>
                <div style={summaryLabelStyle}>TOTAL REQUESTS</div>
                <div style={summaryValueStyle}>{quotes.length}</div>
              </div>
            </div>
          </div>

          {profile ? (
            <p style={signedInStyle}>Signed in as {profile.email ?? "user"}</p>
          ) : null}

          <div style={heroCardStyle}>
            <div style={heroCardLeftStyle}>
              <div style={heroSmallLabelStyle}>Quotes Snapshot</div>
              <div style={heroBigTextStyle}>Keep customer follow-up moving.</div>
              <div style={heroSubTextStyle}>
                Review incoming quote requests, search project details, and turn
                leads into scheduled work.
              </div>
            </div>

            <div style={heroStatsStyle}>
              <div style={miniStatStyle}>
                <div style={miniStatLabelStyle}>Open Requests</div>
                <div style={miniStatValueStyle}>{quotes.length}</div>
              </div>
              <div style={miniStatStyle}>
                <div style={miniStatLabelStyle}>Search Ready</div>
                <div style={miniStatValueStyle}>{filteredQuotes.length}</div>
              </div>
            </div>
          </div>

          <div style={toolbarStyle}>
            <input
              type="text"
              placeholder="Search by name, email, city, sqft, or details"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle}
            />
          </div>

          {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

          {filteredQuotes.length === 0 ? (
            <div style={cardStyle}>
              <h2 style={emptyTitleStyle}>No quote requests yet</h2>
              <p style={emptyTextStyle}>
                When a customer submits the homepage quote form, it will show here.
              </p>
            </div>
          ) : (
            <div style={gridStyle}>
              {filteredQuotes.map((quote) => (
                <article key={quote.id} style={cardStyle}>
                  <div style={cardTopStyle}>
                    <div>
                      <div style={nameStyle}>{quote.full_name || "Unnamed Request"}</div>
                      <div style={metaStyle}>{formatDate(quote.created_at)}</div>
                    </div>

                    <div style={badgeStyle}>{quote.project_type || "Project"}</div>
                  </div>

                  <div style={detailsGridStyle}>
                    <Info label="Email" value={quote.email} />
                    <Info label="Phone" value={quote.phone} />
                    <Info label="City" value={quote.city} />
                    <Info
                      label="Square Footage"
                      value={
                        quote.square_footage !== null && quote.square_footage !== undefined
                          ? String(quote.square_footage)
                          : ""
                      }
                    />
                  </div>

                  <div style={notesBlockStyle}>
                    <div style={notesLabelStyle}>Project Notes</div>
                    <div style={notesTextStyle}>
                      {quote.details?.trim() || "No additional details provided."}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Sidebar() {
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
        <NavItem href="/" label="Home" />
        <NavItem href="/dashboard" label="Dashboard" />
        <NavItem href="/dashboard/jobs" label="Jobs" />
        <NavItem href="/dashboard/leads" label="Leads" />
        <NavItem href="/dashboard/schedule" label="Schedule" />
        <NavItem href="/dashboard/quotes" label="Quotes" active />
        <NavItem href="/configurator" label="Configurator" />
        <NavItem href="/dashboard/finance" label="Finance" />
        <NavItem href="/dashboard/inventory" label="Inventory" />
      </div>
    </>
  );
}

function NavItem({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
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

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={infoBoxStyle}>
      <div style={infoLabelStyle}>{label}</div>
      <div style={infoValueStyle}>{value?.trim() || "—"}</div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
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

const dashboardShellStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "320px 1fr",
  gap: "20px",
  padding: "24px",
  background:
    "radial-gradient(circle at top left, rgba(0, 183, 255, 0.1), transparent 20%), radial-gradient(circle at right center, rgba(0, 140, 255, 0.08), transparent 24%)",
};

const sidebarStyle: React.CSSProperties = {
  borderRadius: "28px",
  padding: "20px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
  alignSelf: "start",
  position: "sticky",
  top: "24px",
};

const brandWrapStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "22px",
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

const mainStyle: React.CSSProperties = {
  minWidth: 0,
};

const heroStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "16px",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: "12px",
  letterSpacing: "0.18em",
  color: "#8fdfff",
  marginBottom: "8px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "64px",
  lineHeight: 1,
};

const subtextStyle: React.CSSProperties = {
  marginTop: "10px",
  color: "rgba(231,243,255,0.78)",
};

const signedInStyle: React.CSSProperties = {
  marginTop: "10px",
  marginBottom: "18px",
  color: "#9fe8ff",
};

const topRightStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const summaryCardStyle: React.CSSProperties = {
  minWidth: "180px",
  padding: "18px",
  borderRadius: "18px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
};

const summaryLabelStyle: React.CSSProperties = {
  color: "rgba(216,238,255,0.66)",
  fontSize: "12px",
  marginBottom: "10px",
};

const summaryValueStyle: React.CSSProperties = {
  fontSize: "34px",
  fontWeight: 700,
};

const heroCardStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.8fr",
  gap: "16px",
  marginBottom: "18px",
  borderRadius: "24px",
  padding: "22px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
};

const heroCardLeftStyle: React.CSSProperties = {};

const heroSmallLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  letterSpacing: "0.16em",
  color: "#8fdfff",
  marginBottom: "10px",
};

const heroBigTextStyle: React.CSSProperties = {
  fontSize: "30px",
  fontWeight: 700,
  lineHeight: 1.1,
  marginBottom: "12px",
};

const heroSubTextStyle: React.CSSProperties = {
  color: "rgba(231,243,255,0.78)",
  lineHeight: 1.7,
};

const heroStatsStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
};

const miniStatStyle: React.CSSProperties = {
  borderRadius: "18px",
  padding: "16px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const miniStatLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "rgba(216,238,255,0.66)",
  marginBottom: "8px",
};

const miniStatValueStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
};

const toolbarStyle: React.CSSProperties = {
  marginBottom: "18px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "520px",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(0,0,0,0.26)",
  color: "white",
  outline: "none",
};

const errorStyle: React.CSSProperties = {
  marginBottom: "18px",
  padding: "14px 16px",
  borderRadius: "14px",
  background: "rgba(255, 90, 90, 0.12)",
  border: "1px solid rgba(255, 90, 90, 0.28)",
  color: "#ffd3d3",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "16px",
};

const cardStyle: React.CSSProperties = {
  borderRadius: "22px",
  padding: "20px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
};

const cardTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "flex-start",
  marginBottom: "18px",
};

const nameStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
};

const metaStyle: React.CSSProperties = {
  marginTop: "6px",
  color: "rgba(231,243,255,0.66)",
  fontSize: "14px",
};

const badgeStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(0, 198, 255, 0.1)",
  border: "1px solid rgba(0, 198, 255, 0.22)",
  color: "#9fe8ff",
  whiteSpace: "nowrap",
  fontSize: "13px",
};

const detailsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};

const infoBoxStyle: React.CSSProperties = {
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const infoLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "rgba(216,238,255,0.66)",
  marginBottom: "8px",
};

const infoValueStyle: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: 1.4,
};

const notesBlockStyle: React.CSSProperties = {
  marginTop: "16px",
  padding: "16px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const notesLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "rgba(216,238,255,0.66)",
  marginBottom: "8px",
};

const notesTextStyle: React.CSSProperties = {
  lineHeight: 1.65,
  color: "rgba(231,243,255,0.82)",
};

const emptyTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "24px",
};

const emptyTextStyle: React.CSSProperties = {
  marginTop: "10px",
  color: "rgba(231,243,255,0.76)",
};
