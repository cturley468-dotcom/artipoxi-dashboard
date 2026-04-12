"use client";

import { useMemo, useState } from "react";

type Job = {
  id: string;
  status: "open" | "scheduled" | "in_progress" | "complete";
  customer: string;
  location: string;
  value: number;
  type: string;
};

const mockJobs: Job[] = [
  {
    id: "d9d72efe-4f1b-4ac6-a463-77a6fc24b1f3",
    status: "complete",
    customer: "Anderson Garage Coating",
    location: "Anderson, SC",
    value: 4200,
    type: "Flake System",
  },
  {
    id: "740d87cd-fca2-4242-9f16-6789a65c8b35",
    status: "open",
    customer: "Premium Shop Floor",
    location: "Greenville, SC",
    value: 6800,
    type: "Metallic Resin",
  },
  {
    id: "3fa27c3b-4d0f-4db3-b7b4-91aa6122d9e8",
    status: "scheduled",
    customer: "Patio Recoat Project",
    location: "Clemson, SC",
    value: 2800,
    type: "Solid Color Epoxy",
  },
  {
    id: "aa89cd0a-139d-4b79-b83f-e4fb93dd8ef1",
    status: "in_progress",
    customer: "Commercial Entry Floor",
    location: "Spartanburg, SC",
    value: 9100,
    type: "Commercial Flake",
  },
];

export default function JobsPage() {
  const [search, setSearch] = useState("");

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return mockJobs;

    return mockJobs.filter((job) =>
      [job.id, job.customer, job.location, job.type, job.status, String(job.value)]
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [search]);

  const openCount = mockJobs.filter((job) => job.status === "open").length;
  const scheduledCount = mockJobs.filter((job) => job.status === "scheduled").length;
  const inProgressCount = mockJobs.filter((job) => job.status === "in_progress").length;
  const openValue = mockJobs
    .filter((job) => job.status !== "complete")
    .reduce((sum, job) => sum + job.value, 0);

  return (
    <>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>PROJECT TRACKING</div>
          <h1 style={titleStyle}>Jobs</h1>
          <p style={subtitleStyle}>
            Track saved jobs, update statuses, and move work from quote to production.
          </p>
        </div>

        <div style={topActionsStyle}>
          <button style={primaryActionStyle}>New Quote</button>
        </div>
      </div>

      <div style={heroCardStyle}>
        <div style={heroLeftStyle}>
          <div style={heroSmallLabelStyle}>Jobs Snapshot</div>
          <div style={heroBigTextStyle}>Keep production moving.</div>
          <div style={heroTextStyle}>
            View open jobs, update statuses, and manage the value of active work
            from one page.
          </div>
        </div>

        <div style={heroRightStyle}>
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

      <div style={jobsGridStyle}>
        {filteredJobs.map((job) => (
          <article key={job.id} style={jobCardStyle}>
            <div style={jobTopStyle}>
              <div style={jobIdStyle}>Job ID: {job.id}</div>
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

            <div style={jobTitleStyle}>{job.customer}</div>
            <div style={jobMetaStyle}>{job.location}</div>

            <div style={detailsGridStyle}>
              <Info label="System" value={job.type} />
              <Info label="Value" value={`$${job.value.toLocaleString()}`} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoBoxStyle}>
      <div style={infoLabelStyle}>{label}</div>
      <div style={infoValueStyle}>{value}</div>
    </div>
  );
}

function formatStatus(status: Job["status"]) {
  switch (status) {
    case "in_progress":
      return "in progress";
    default:
      return status;
  }
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

const jobsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "16px",
};

const jobCardStyle: React.CSSProperties = {
  borderRadius: "22px",
  padding: "20px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
};

const jobTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "flex-start",
  marginBottom: "16px",
};

const jobIdStyle: React.CSSProperties = {
  color: "#8fdfff",
  fontSize: "14px",
  fontWeight: 700,
  wordBreak: "break-all",
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

const jobTitleStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  marginBottom: "8px",
};

const jobMetaStyle: React.CSSProperties = {
  color: "rgba(231,243,255,0.76)",
  marginBottom: "16px",
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
