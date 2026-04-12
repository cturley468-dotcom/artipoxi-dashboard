"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type QuoteRequest = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  square_footage: number | null;
  project_type: string | null;
  details: string | null;
  created_at: string;
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotes();
  }, []);

  async function loadQuotes() {
    setLoading(true);

    const { data, error } = await supabase
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load quotes:", error);
      setQuotes([]);
      setLoading(false);
      return;
    }

    setQuotes((data as QuoteRequest[]) || []);
    setLoading(false);
  }

  const visibleQuotes = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return quotes;

    return quotes.filter((quote) => {
      return [
        quote.full_name,
        quote.phone,
        quote.email,
        quote.city,
        quote.project_type,
        quote.details,
        quote.square_footage?.toString(),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [quotes, search]);

  function handleEdit(quote: QuoteRequest) {
    alert(`Edit quote: ${quote.full_name || quote.id}`);
  }

  function handleDelete(quote: QuoteRequest) {
    alert(`Delete quote: ${quote.full_name || quote.id}`);
  }

  function handleConvert(quote: QuoteRequest) {
    alert(`Convert to job: ${quote.full_name || quote.id}`);
  }

  return (
    <section style={pageWrap}>
      <div style={headerBlock}>
        <div style={headerTextBlock}>
          <div style={eyebrow}>CUSTOMER REQUESTS</div>
          <h1 style={pageTitle}>Quotes</h1>
          <p style={pageSubtitle}>
            Review quote requests submitted from the homepage.
          </p>
        </div>

        <div style={summaryBox}>
          <div style={summaryLabel}>TOTAL</div>
          <div style={summaryValue}>{visibleQuotes.length}</div>
        </div>
      </div>

      <div style={searchRow}>
        <input
          type="text"
          placeholder="Search by name, email, city, sqft, or details"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInput}
        />
      </div>

      {loading ? (
        <div style={emptyPanel}>Loading quote requests...</div>
      ) : visibleQuotes.length === 0 ? (
        <div style={emptyPanel}>
          No quote requests yet. When a customer submits the homepage quote form,
          it will show here.
        </div>
      ) : (
        <div style={cardsWrap}>
          {visibleQuotes.map((quote) => (
            <article key={quote.id} style={quoteCard}>
              <div style={cardHeader}>
                <div style={cardHeaderText}>
                  <h2 style={customerName}>
                    {quote.full_name?.trim() || "Unnamed quote"}
                  </h2>
                  <div style={createdAtText}>
                    {formatDateTime(quote.created_at)}
                  </div>
                </div>

                <div style={projectBadge}>
                  {quote.project_type?.trim() || "Project"}
                </div>
              </div>

              <div style={actionRow}>
                <button
                  type="button"
                  style={ghostButton}
                  onClick={() => handleEdit(quote)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  style={dangerButton}
                  onClick={() => handleDelete(quote)}
                >
                  Delete
                </button>
                <button
                  type="button"
                  style={primaryButton}
                  onClick={() => handleConvert(quote)}
                >
                  Convert to Job
                </button>
              </div>

              <div style={fieldStack}>
                <Field label="Email" value={quote.email} />
                <Field label="Phone" value={quote.phone} />
                <Field label="City" value={quote.city} />
                <Field
                  label="Square Footage"
                  value={
                    quote.square_footage !== null &&
                    quote.square_footage !== undefined
                      ? String(quote.square_footage)
                      : ""
                  }
                />
              </div>

              <div style={notesPanel}>
                <div style={fieldLabel}>Project Notes</div>
                <div style={notesValue}>
                  {quote.details?.trim() || "No additional details provided."}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div style={fieldBox}>
      <div style={fieldLabel}>{label}</div>
      <div style={fieldValue}>{value?.trim() || "—"}</div>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

const pageWrap: React.CSSProperties = {
  width: "100%",
};

const headerBlock: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const headerTextBlock: React.CSSProperties = {
  minWidth: 0,
};

const eyebrow: React.CSSProperties = {
  fontSize: "12px",
  letterSpacing: "0.18em",
  color: "#8fdfff",
  marginBottom: "8px",
};

const pageTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "64px",
  lineHeight: 1,
  color: "white",
};

const pageSubtitle: React.CSSProperties = {
  marginTop: "10px",
  color: "rgba(231,243,255,0.78)",
};

const summaryBox: React.CSSProperties = {
  minWidth: "150px",
  padding: "16px",
  borderRadius: "18px",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
};

const summaryLabel: React.CSSProperties = {
  fontSize: "12px",
  color: "rgba(216,238,255,0.66)",
  marginBottom: "8px",
};

const summaryValue: React.CSSProperties = {
  fontSize: "30px",
  fontWeight: 700,
  color: "white",
};

const searchRow: React.CSSProperties = {
  marginBottom: "20px",
};

const searchInput: React.CSSProperties = {
  width: "100%",
  maxWidth: "620px",
  padding: "13px 15px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(0,0,0,0.26)",
  color: "white",
  outline: "none",
};

const emptyPanel: React.CSSProperties = {
  borderRadius: "20px",
  padding: "18px",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
  color: "rgba(231,243,255,0.82)",
};

const cardsWrap: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: "16px",
  alignItems: "start",
};

const quoteCard: React.CSSProperties = {
  borderRadius: "20px",
  padding: "16px",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
  minWidth: 0,
  overflow: "hidden",
};

const cardHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "14px",
};

const cardHeaderText: React.CSSProperties = {
  minWidth: 0,
  flex: "1 1 220px",
};

const customerName: React.CSSProperties = {
  margin: 0,
  fontSize: "20px",
  fontWeight: 700,
  lineHeight: 1.1,
  color: "white",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};

const createdAtText: React.CSSProperties = {
  marginTop: "6px",
  fontSize: "13px",
  color: "rgba(231,243,255,0.66)",
  overflowWrap: "anywhere",
};

const projectBadge: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: "999px",
  background: "rgba(0, 198, 255, 0.1)",
  border: "1px solid rgba(0, 198, 255, 0.22)",
  color: "#9fe8ff",
  fontSize: "12px",
  lineHeight: 1.2,
  maxWidth: "120px",
  textAlign: "center",
};

const actionRow: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginBottom: "14px",
};

const primaryButton: React.CSSProperties = {
  border: "none",
  borderRadius: "12px",
  padding: "10px 12px",
  fontWeight: 700,
  cursor: "pointer",
  color: "#031019",
  background:
    "linear-gradient(135deg, rgba(0,212,255,0.95), rgba(0,140,255,0.9))",
};

const ghostButton: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "12px",
  padding: "10px 12px",
  fontWeight: 700,
  cursor: "pointer",
  color: "white",
  background: "rgba(255,255,255,0.05)",
};

const dangerButton: React.CSSProperties = {
  border: "1px solid rgba(255, 90, 90, 0.24)",
  borderRadius: "12px",
  padding: "10px 12px",
  fontWeight: 700,
  cursor: "pointer",
  color: "#ffd3d3",
  background: "rgba(255, 90, 90, 0.1)",
};

const fieldStack: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "10px",
};

const fieldBox: React.CSSProperties = {
  padding: "12px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
  minWidth: 0,
  overflow: "hidden",
};

const fieldLabel: React.CSSProperties = {
  fontSize: "11px",
  color: "rgba(216,238,255,0.66)",
  marginBottom: "6px",
};

const fieldValue: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: 1.35,
  color: "white",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};

const notesPanel: React.CSSProperties = {
  marginTop: "14px",
  padding: "14px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const notesValue: React.CSSProperties = {
  lineHeight: 1.55,
  color: "rgba(231,243,255,0.82)",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};
