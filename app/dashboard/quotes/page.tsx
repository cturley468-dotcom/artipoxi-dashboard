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

        if (error) {
          throw error;
        }

        if (!mounted) return;
        setQuotes((data ?? []) as QuoteRequest[]);
      } catch (error) {
        console.error(error);
        if (!mounted) return;
        setErrorMessage("Could not load quote requests.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
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

    return quotes.filter((quote) => {
      return [
        quote.full_name,
        quote.email,
        quote.phone,
        quote.city,
        quote.project_type,
        quote.details,
        quote.square_footage?.toString(),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [quotes, search]);

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>Loading quote requests...</div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={headerRowStyle}>
        <div>
          <div style={eyebrowStyle}>CUSTOMER REQUESTS</div>
          <h1 style={titleStyle}>Quotes</h1>
          <p style={subtextStyle}>
            Review quote requests submitted from the homepage.
          </p>
          {profile ? (
            <p style={signedInStyle}>Signed in as {profile.email ?? "user"}</p>
          ) : null}
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Total Requests</div>
          <div style={summaryValueStyle}>{quotes.length}</div>
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
                  <div style={metaStyle}>
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
    </main>
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
  padding: "24px",
  color: "white",
};

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: "12px",
  letterSpacing: "0.18em",
  color: "#8fdfff",
  marginBottom: "8px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "48px",
  lineHeight: 1,
};

const subtextStyle: React.CSSProperties = {
  marginTop: "10px",
  color: "rgba(231,243,255,0.78)",
};

const signedInStyle: React.CSSProperties = {
  marginTop: "10px",
  color: "#9fe8ff",
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

const toolbarStyle: React.CSSProperties = {
  marginBottom: "20px",
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
