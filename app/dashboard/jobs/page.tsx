"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Job = {
  id: string;
  quote_request_id: string | null;
  customer: string;
  phone: string | null;
  email: string | null;
  location: string | null;
  square_footage: number | null;
  system_type: string | null;
  notes: string | null;
  photo_urls: string[] | null;
  status: string;
  value: number | null;
  created_at: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 900);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function loadJobs() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load jobs:", error);
      setJobs([]);
      setMessage("Could not load jobs.");
      setLoading(false);
      return;
    }

    setJobs((data as Job[]) || []);
    setLoading(false);
  }

  const visibleJobs = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return jobs;

    return jobs.filter((job) =>
      [
        job.id,
        job.customer,
        job.phone,
        job.email,
        job.location,
        job.system_type,
        job.notes,
        job.status,
        job.value?.toString(),
        job.square_footage?.toString(),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [jobs, search]);

  const openCount = jobs.filter((job) => job.status === "open").length;
  const scheduledCount = jobs.filter((job) => job.status === "scheduled").length;
  const inProgressCount = jobs.filter((job) => job.status === "in_progress").length;
  const openValue = jobs
    .filter((job) => job.status !== "complete")
    .reduce((sum, job) => sum + Number(job.value || 0), 0);

  async function updateJobStatus(jobId: string, nextStatus: string) {
    setMessage("");

    const { error } = await supabase
      .from("jobs")
      .update({ status: nextStatus })
      .eq("id", jobId);

    if (error) {
      console.error(error);
      setMessage("Could not update job status.");
      return;
    }

    setMessage("Job updated.");
    await loadJobs();
  }

  return (
    <section style={pageWrap}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>PROJECT TRACKING</div>
          <h1 style={titleStyle}>Jobs</h1>
          <p style={subtitleStyle}>
            Track saved jobs, update statuses, and move work from quote to production.
          </p>
        </div>

        <div style={topActionsStyle}>
          <button style={primaryActionStyle} type="button">
            New Job
          </button>
        </div>
      </div>

      <div
        style={{
          ...heroCardStyle,
          ...(isMobile ? heroCardMobileStyle : null),
        }}
      >
        <div style={heroLeftStyle}>
          <div style={heroSmallLabelStyle}>Jobs Snapshot</div>
          <div style={heroBigTextStyle}>Keep production moving.</div>
          <div style={heroTextStyle}>
            View open jobs, update statuses, and manage active work from one page.
          </div>
        </div>

        <div
          style={{
            ...heroRightStyle,
            ...(isMobile ? heroRightMobileStyle : null),
          }}
        >
          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>OPEN</div>
            <div style={miniStatValueStyle}>{openCount}</div>
          </div>

          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>SCHEDULED</div>
            <div style={miniStatValueStyle}>{scheduledCount}</div>
          </div>

          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>IN PROGRESS</div>
            <div style={miniStatValueStyle}>{inProgressCount}</div>
          </div>

          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>OPEN VALUE</div>
            <div style={miniStatValueStyle}>${openValue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div style={toolbarStyle}>
        <input
          type="text"
          placeholder="Search jobs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      {message ? <div style={messageBoxStyle}>{message}</div> : null}

      {loading ? (
        <div style={emptyPanelStyle}>Loading jobs...</div>
      ) : visibleJobs.length === 0 ? (
        <div style={emptyPanelStyle}>
          No jobs yet. Convert a quote into a job and it will appear here.
        </div>
      ) : (
        <div style={rowsWrapStyle}>
          {visibleJobs.map((job) => {
            const photos = Array.isArray(job.photo_urls) ? job.photo_urls : [];

            return (
              <article key={job.id} style={jobRowCardStyle}>
                <div style={jobTopStyle}>
                  <div style={jobTopLeftStyle}>
                    <div style={jobIdStyle}>Job ID: {job.id}</div>
                    <div style={jobTitleStyle}>{job.customer}</div>
                    <div style={jobMetaStyle}>
                      {job.location || "No location"} • {formatDate(job.created_at)}
                    </div>
                  </div>

                  <div
                    style={{
                      ...statusBadgeStyle,
                      ...(job.status === "complete"
                        ? completeBadgeStyle
                        : job.status === "in_progress"
                        ? progressBadgeStyle
                        : job.status === "scheduled"
                        ? scheduledBadgeStyle
                        : openBadgeStyle),
                    }}
                  >
                    {formatStatus(job.status)}
                  </div>
                </div>

                <div style={actionRowStyle}>
                  <button
                    type="button"
                    style={ghostButtonStyle}
                    onClick={() => updateJobStatus(job.id, "open")}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    style={ghostButtonStyle}
                    onClick={() => updateJobStatus(job.id, "scheduled")}
                  >
                    Scheduled
                  </button>
                  <button
                    type="button"
                    style={ghostButtonStyle}
                    onClick={() => updateJobStatus(job.id, "in_progress")}
                  >
                    In Progress
                  </button>
                  <button
                    type="button"
                    style={primaryButtonStyle}
                    onClick={() => updateJobStatus(job.id, "complete")}
                  >
                    Complete
                  </button>
                </div>

                <div
                  style={{
                    ...detailsGridStyle,
                    ...(isMobile ? detailsGridMobileStyle : null),
                  }}
                >
                  <Info label="System" value={job.system_type} />
                  <Info
                    label="Value"
                    value={
                      job.value !== null && job.value !== undefined
                        ? `$${Number(job.value).toLocaleString()}`
                        : "$0"
                    }
                  />
                  <Info label="Phone" value={job.phone} />
                  <Info label="Email" value={job.email} />
                  <Info
                    label="Square Footage"
                    value={
                      job.square_footage !== null && job.square_footage !== undefined
                        ? String(job.square_footage)
                        : "—"
                    }
                  />
                  <Info
                    label="Source Quote"
                    value={job.quote_request_id ? "Converted quote" : "Manual job"}
                  />
                </div>

                {photos.length > 0 ? (
                  <div style={photosSectionStyle}>
                    <div style={notesLabelStyle}>Project Photos</div>
                    <div style={photosWrapStyle}>
                      {photos.map((url, index) => (
                        <a
                          key={`${job.id}-${index}`}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          style={photoLinkStyle}
                        >
                          <img
                            src={url}
                            alt={`Job photo ${index + 1}`}
                            style={{
                              ...photoThumbStyle,
                              ...(isMobile ? photoThumbMobileStyle : null),
                            }}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div style={notesBoxStyle}>
                  <div style={notesLabelStyle}>Notes</div>
                  <div style={notesTextStyle}>
                    {job.notes?.trim() || "No notes added yet."}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
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

function formatStatus(status: string) {
  switch (status) {
    case "in_progress":
      return "in progress";
    default:
      return status;
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

const pageWrap: React.CSSProperties = {
  width: "100%",
};

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

const topActionsStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const primaryActionStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 16px",
  borderRadius: "14px",
  fontWeight: 700,
  color: "#031019",
  background: "linear-gradient(135deg, rgba(0,212,255,0.95), rgba(0,140,255,0.9))",
  border: "none",
  cursor: "pointer",
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

const heroCardMobileStyle: React.CSSProperties = {
  gridTemplateColumns: "1fr",
};

const heroLeftStyle: React.CSSProperties = {};

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

const heroRightStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};

const heroRightMobileStyle: React.CSSProperties = {
  gridTemplateColumns: "1fr 1fr",
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

const messageBoxStyle: React.CSSProperties = {
  marginBottom: "16px",
  padding: "12px 14px",
  borderRadius: "14px",
  background: "rgba(0,198,255,0.08)",
  border: "1px solid rgba(0,198,255,0.18)",
  color: "#9fe8ff",
};

const emptyPanelStyle: React.CSSProperties = {
  borderRadius: "22px",
  padding: "20px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
  color: "rgba(231,243,255,0.82)",
};

const rowsWrapStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "12px",
};

const jobRowCardStyle: React.CSSProperties = {
  borderRadius: "18px",
  padding: "14px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
  minWidth: 0,
  overflow: "hidden",
};

const jobTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "flex-start",
  marginBottom: "12px",
  flexWrap: "wrap",
};

const jobTopLeftStyle: React.CSSProperties = {
  minWidth: 0,
  flex: "1 1 260px",
};

const jobIdStyle: React.CSSProperties = {
  color: "#8fdfff",
  fontSize: "13px",
  fontWeight: 700,
  wordBreak: "break-all",
  marginBottom: "6px",
};

const jobTitleStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
  marginBottom: "6px",
  lineHeight: 1.1,
  wordBreak: "break-word",
};

const jobMetaStyle: React.CSSProperties = {
  color: "rgba(231,243,255,0.76)",
};

const statusBadgeStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 700,
  textTransform: "capitalize",
  whiteSpace: "nowrap",
};

const openBadgeStyle: React.CSSProperties = {
  color: "#bfe8ff",
  background: "rgba(0, 198, 255, 0.12)",
  border: "1px solid rgba(0, 198, 255, 0.22)",
};

const scheduledBadgeStyle: React.CSSProperties = {
  color: "#ffe9b3",
  background: "rgba(255, 191, 0, 0.12)",
  border: "1px solid rgba(255, 191, 0, 0.22)",
};

const progressBadgeStyle: React.CSSProperties = {
  color: "#ffd3d3",
  background: "rgba(255, 90, 90, 0.12)",
  border: "1px solid rgba(255, 90, 90, 0.22)",
};

const completeBadgeStyle: React.CSSProperties = {
  color: "#bfffd6",
  background: "rgba(52, 199, 89, 0.12)",
  border: "1px solid rgba(52, 199, 89, 0.22)",
};

const actionRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginBottom: "12px",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "10px",
  padding: "9px 12px",
  fontWeight: 700,
  cursor: "pointer",
  color: "#031019",
  background: "linear-gradient(135deg, rgba(0,212,255,0.95), rgba(0,140,255,0.9))",
};

const ghostButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "10px",
  padding: "9px 12px",
  fontWeight: 700,
  cursor: "pointer",
  color: "white",
  background: "rgba(255,255,255,0.05)",
};

const detailsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
  gap: "10px",
};

const detailsGridMobileStyle: React.CSSProperties = {
  gridTemplateColumns: "1fr 1fr",
};

const infoBoxStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
  minWidth: 0,
  overflow: "hidden",
};

const infoLabelStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "rgba(216,238,255,0.66)",
  marginBottom: "6px",
};

const infoValueStyle: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: 1.35,
  wordBreak: "break-word",
};

const photosSectionStyle: React.CSSProperties = {
  marginTop: "12px",
};

const photosWrapStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginTop: "8px",
};

const photoLinkStyle: React.CSSProperties = {
  display: "block",
};

const photoThumbStyle: React.CSSProperties = {
  width: "96px",
  height: "96px",
  objectFit: "cover",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.12)",
};

const photoThumbMobileStyle: React.CSSProperties = {
  width: "120px",
  height: "120px",
};

const notesBoxStyle: React.CSSProperties = {
  marginTop: "12px",
  padding: "12px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const notesLabelStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "rgba(216,238,255,0.66)",
  marginBottom: "6px",
};

const notesTextStyle: React.CSSProperties = {
  lineHeight: 1.5,
  color: "rgba(231,243,255,0.82)",
  wordBreak: "break-word",
};
