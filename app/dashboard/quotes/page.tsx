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
  status: string | null;
  converted_to_job_id: string | null;
};

type EditForm = {
  full_name: string;
  phone: string;
  email: string;
  city: string;
  square_footage: string;
  project_type: string;
  details: string;
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [editForm, setEditForm] = useState<EditForm>({
    full_name: "",
    phone: "",
    email: "",
    city: "",
    square_footage: "",
    project_type: "",
    details: "",
  });

  useEffect(() => {
    loadQuotes();
  }, []);

  async function loadQuotes() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("quote_requests")
      .select("*")
      .neq("status", "converted")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load quotes:", error);
      setQuotes([]);
      setMessage("Could not load quote requests.");
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

  function startEdit(quote: QuoteRequest) {
    setEditingId(quote.id);
    setMessage("");
    setEditForm({
      full_name: quote.full_name ?? "",
      phone: quote.phone ?? "",
      email: quote.email ?? "",
      city: quote.city ?? "",
      square_footage:
        quote.square_footage !== null && quote.square_footage !== undefined
          ? String(quote.square_footage)
          : "",
      project_type: quote.project_type ?? "",
      details: quote.details ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setMessage("");
  }

  async function saveEdit(id: string) {
    setWorkingId(id);
    setMessage("");

    const { error } = await supabase
      .from("quote_requests")
      .update({
        full_name: editForm.full_name.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim(),
        city: editForm.city.trim(),
        square_footage: editForm.square_footage
          ? Number(editForm.square_footage)
          : null,
        project_type: editForm.project_type.trim(),
        details: editForm.details.trim(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      setMessage("Could not save quote changes.");
      setWorkingId(null);
      return;
    }

    setEditingId(null);
    setWorkingId(null);
    setMessage("Quote updated.");
    await loadQuotes();
  }

  async function deleteQuote(id: string) {
    const confirmed = window.confirm("Delete this quote request?");
    if (!confirmed) return;

    setWorkingId(id);
    setMessage("");

    const { error } = await supabase
      .from("quote_requests")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setMessage("Could not delete quote.");
      setWorkingId(null);
      return;
    }

    setWorkingId(null);
    setMessage("Quote deleted.");
    await loadQuotes();
  }

  async function convertToJob(quote: QuoteRequest) {
    const confirmed = window.confirm("Convert this quote into a job?");
    if (!confirmed) return;

    setWorkingId(quote.id);
    setMessage("");

    const { data: insertedJob, error: insertError } = await supabase
      .from("jobs")
      .insert([
        {
          quote_request_id: quote.id,
          customer: quote.full_name?.trim() || "Unnamed customer",
          phone: quote.phone?.trim() || null,
          email: quote.email?.trim() || null,
          location: quote.city?.trim() || null,
          square_footage: quote.square_footage ?? null,
          system_type: quote.project_type?.trim() || null,
          notes: quote.details?.trim() || null,
          status: "open",
          value: 0,
        },
      ])
      .select("id")
      .single();

    if (insertError || !insertedJob) {
      console.error(insertError);
      setMessage("Could not convert quote to job.");
      setWorkingId(null);
      return;
    }

    const { error: updateError } = await supabase
      .from("quote_requests")
      .update({
        status: "converted",
        converted_to_job_id: insertedJob.id,
      })
      .eq("id", quote.id);

    if (updateError) {
      console.error(updateError);
      setMessage("Job created, but quote status could not be updated.");
      setWorkingId(null);
      return;
    }

    setWorkingId(null);
    setMessage("Quote converted to job.");
    await loadQuotes();
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

      {message ? <div style={messageBox}>{message}</div> : null}

      {loading ? (
        <div style={emptyPanel}>Loading quote requests...</div>
      ) : visibleQuotes.length === 0 ? (
        <div style={emptyPanel}>
          No active quote requests right now.
        </div>
      ) : (
        <div style={rowsWrap}>
          {visibleQuotes.map((quote) => {
            const isEditing = editingId === quote.id;
            const isWorking = workingId === quote.id;

            return (
              <article key={quote.id} style={quoteRowCard}>
                <div style={rowTop}>
                  <div style={rowIdentity}>
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
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        style={primaryButton}
                        onClick={() => saveEdit(quote.id)}
                        disabled={isWorking}
                      >
                        {isWorking ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        style={ghostButton}
                        onClick={cancelEdit}
                        disabled={isWorking}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        style={ghostButton}
                        onClick={() => startEdit(quote)}
                        disabled={isWorking}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        style={dangerButton}
                        onClick={() => deleteQuote(quote.id)}
                        disabled={isWorking}
                      >
                        {isWorking ? "Deleting..." : "Delete"}
                      </button>
                      <button
                        type="button"
                        style={primaryButton}
                        onClick={() => convertToJob(quote)}
                        disabled={isWorking}
                      >
                        {isWorking ? "Converting..." : "Convert to Job"}
                      </button>
                    </>
                  )}
                </div>

                {isEditing ? (
                  <div style={editGrid}>
                    <input
                      style={editInput}
                      placeholder="Full Name"
                      value={editForm.full_name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, full_name: e.target.value })
                      }
                    />
                    <input
                      style={editInput}
                      placeholder="Phone"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                    />
                    <input
                      style={editInput}
                      placeholder="Email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                    />
                    <input
                      style={editInput}
                      placeholder="City"
                      value={editForm.city}
                      onChange={(e) =>
                        setEditForm({ ...editForm, city: e.target.value })
                      }
                    />
                    <input
                      style={editInput}
                      placeholder="Square Footage"
                      value={editForm.square_footage}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          square_footage: e.target.value,
                        })
                      }
                    />
                    <input
                      style={editInput}
                      placeholder="Project Type"
                      value={editForm.project_type}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          project_type: e.target.value,
                        })
                      }
                    />
                    <textarea
                      style={editTextarea}
                      placeholder="Project details"
                      value={editForm.details}
                      onChange={(e) =>
                        setEditForm({ ...editForm, details: e.target.value })
                      }
                    />
                  </div>
                ) : (
                  <>
                    <div style={compactInfoGrid}>
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
                  </>
                )}
              </article>
            );
          })}
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

const pageWrap: React.CSSProperties = { width: "100%" };
const headerBlock: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "18px",
};
const headerTextBlock: React.CSSProperties = { minWidth: 0 };
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
  padding: "14px 16px",
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
  fontSize: "28px",
  fontWeight: 700,
  color: "white",
};
const searchRow: React.CSSProperties = { marginBottom: "16px" };
const searchInput: React.CSSProperties = {
  width: "100%",
  maxWidth: "620px",
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(0,0,0,0.26)",
  color: "white",
  outline: "none",
};
const messageBox: React.CSSProperties = {
  marginBottom: "16px",
  padding: "12px 14px",
  borderRadius: "14px",
  background: "rgba(0,198,255,0.08)",
  border: "1px solid rgba(0,198,255,0.18)",
  color: "#9fe8ff",
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
const rowsWrap: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "14px",
};
const quoteRowCard: React.CSSProperties = {
  borderRadius: "18px",
  padding: "14px",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
  minWidth: 0,
  overflow: "hidden",
};
const rowTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "12px",
};
const rowIdentity: React.CSSProperties = {
  minWidth: 0,
  flex: "1 1 240px",
};
const customerName: React.CSSProperties = {
  margin: 0,
  fontSize: "22px",
  fontWeight: 700,
  lineHeight: 1.05,
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
  marginBottom: "12px",
};
const primaryButton: React.CSSProperties = {
  border: "none",
  borderRadius: "10px",
  padding: "9px 12px",
  fontWeight: 700,
  cursor: "pointer",
  color: "#031019",
  background:
    "linear-gradient(135deg, rgba(0,212,255,0.95), rgba(0,140,255,0.9))",
};
const ghostButton: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "10px",
  padding: "9px 12px",
  fontWeight: 700,
  cursor: "pointer",
  color: "white",
  background: "rgba(255,255,255,0.05)",
};
const dangerButton: React.CSSProperties = {
  border: "1px solid rgba(255, 90, 90, 0.24)",
  borderRadius: "10px",
  padding: "9px 12px",
  fontWeight: 700,
  cursor: "pointer",
  color: "#ffd3d3",
  background: "rgba(255, 90, 90, 0.1)",
};
const compactInfoGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "10px",
};
const fieldBox: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "12px",
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
  marginTop: "12px",
  padding: "12px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
};
const notesValue: React.CSSProperties = {
  lineHeight: 1.45,
  color: "rgba(231,243,255,0.82)",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};
const editGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "10px",
};
const editInput: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(0,0,0,0.26)",
  color: "white",
  outline: "none",
};
const editTextarea: React.CSSProperties = {
  gridColumn: "1 / -1",
  minHeight: "90px",
  width: "100%",
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(0,0,0,0.26)",
  color: "white",
  outline: "none",
  resize: "vertical",
};
