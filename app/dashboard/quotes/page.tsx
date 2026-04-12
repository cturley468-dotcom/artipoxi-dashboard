"use client";

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

  const openRequests = quotes.length;
  const searchResults = filteredQuotes.length;
  const latestRequest =
    quotes.length > 0 ? formatDate(quotes[0].created_at) : "—";

  if (loading) {
    return (
      <div style={loadingCardStyle}>
        Loading quote requests...
      </div>
    );
  }

  return (
    <>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>CUSTOMER REQUESTS</div>
          <h1 style={titleStyle}>Quotes</h1>
          <p style={subtitleStyle}>
            Review quote requests submitted from the homepage.
          </p>
          {profile ? (
            <p style={signedInStyle}>
              Signed in as {profile.email ?? "user"}
            </p>
          ) : null}
        </div>

        <div style={topStatsWrapStyle}>
          <div style={topStatCardStyle}>
            <div style={topStatLabelStyle}>Open Requests</div>
            <div style={topStatValueStyle}>{openRequests}</div>
          </div>

          <div style={topStatCardStyle}>
            <div style={topStatLabelStyle}>Search Results</div>
            <div style={topStatValueStyle}>{searchResults}</div>
          </div>
        </div>
      </div>

      <div style={heroCardStyle}>
        <div style={heroLeftStyle}>
          <div style={heroSmallLabelStyle}>Quotes Snapshot</div>
          <div style={heroBigTextStyle}>Keep customer follow-up moving.</div>
          <div style={heroTextStyle}>
            Review incoming quote requests, search project details, and turn
            leads into scheduled work.
          </div>
        </div>

        <div style={heroRightStyle}>
          <div style={miniCardStyle}>
            <div style={miniCardLabelStyle}>Most Recent</div>
            <div style={miniCardValueStyle}>{latestRequest}</div>
          </div>

          <div style={miniCardStyle}>
            <div style={miniCardLabelStyle}>Customer Requests</div>
            <div style={miniCardValueStyle}>{openRequests}</div>
          </div>
        </div>
      </div>

      <div style={toolbarStyle}>
        <input
          type="text"
          placeholder="Search by name, email, city, sqft, or details"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      {filteredQuotes.length === 0 ? (
        <div style={panelStyle}>
          <h2 style={emptyTitleStyle}>No quote requests yet</h2>
          <p style={emptyTextStyle}>
            When a customer submits the homepage quote form, it will show here.
          </p>
        </div>
      ) : (
        <div style={quotesGridStyle}>
          {filteredQuotes.map((quote) => (
            <article key={quote.id} style={panelStyle}>
              <div style={quoteTopStyle}>
                <div>
                  <div style={quoteNameStyle}>
                    {quote.full_name || "Unnamed Request"}
                  </div>
                  <div style={quoteDateStyle}>
                    {formatDate(quote.created_at)}
                  </div>
                </div>

                <div style={badgeStyle}>
                  {quote.project_type || "Project"}
                </div>
              </div>

              <div style={detailsGridStyle}>
                <Info label="Email" value={quote.email} />
                <Info label="Phone" value={quote.phone} />
                <Info label="City" value={quote.city} />
                <Info
                  label="Square Footage"
                  value={
                    quote.square_footage !== null &&
                    quote.square_footage !== undefined
                      ? String(quote.square_footage)
                      : ""
                  }
                />
              </div>

              <div style={notesBoxStyle}>
                <div style={notesLabelStyle}>Project Notes</div>
                <div style={notesTextStyle}>
                  {quote.details?.trim() || "No additional details provided."}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
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

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "18px",
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

const subtitleStyle: React.CSSProperties = {
  marginTop: "10px",
  color: "rgba(231,243,255,0.78)",
};

const signedInStyle: React.CSSProperties = {
  marginTop: "10px",
  color: "#9fe8ff",
};

const topStatsWrapStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(140px, 1fr))",
  gap: "12px",
};

const topStatCardStyle: React.CSSProperties = {
  borderRadius: "18px",
  padding: "18px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
  minWidth: "140px",
};

const topStatLabelStyle: React.CSSProperties = {
  color: "rgba(216,238,255,0.66)",
  fontSize: "12px",
  marginBottom: "8px",
};

const topStatValueStyle: React.CSSProperties = {
  fontSize: "28px",
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

const heroLeftStyle: React.CSSProperties = {};

const heroRightStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
};

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

const heroTextStyle: React.CSSProperties = {
  color: "rgba(231,243,255,0.78)",
  lineHeight: 1.7,
};

const miniCardStyle: React.CSSProperties = {
  borderRadius: "18px",
  padding: "16px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const miniCardLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "rgba(216,238,255,0.66)",
  marginBottom: "8px",
};

const miniCardValueStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
};

const toolbarStyle: React.CSSProperties = {
  marginBottom: "18px",
};

const searchInputStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "560px",
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

const quotesGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "16px",
};

const panelStyle: React.CSSProperties = {
  borderRadius: "22px",
  padding: "20px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
};

const quoteTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "flex-start",
  marginBottom: "18px",
};

const quoteNameStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
};

const quoteDateStyle: React.CSSProperties = {
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

const notesBoxStyle: React.CSSProperties = {
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

const loadingCardStyle: React.CSSProperties = {
  borderRadius: "22px",
  padding: "20px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
};
