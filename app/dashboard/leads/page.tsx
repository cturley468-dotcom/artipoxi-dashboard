"use client";

import { useMemo, useState } from "react";

type Lead = {
  id: string;
  name: string;
  phone: string;
  city: string;
  project: string;
  stage: "new" | "follow_up" | "quoted" | "won";
  notes: string;
};

const mockLeads: Lead[] = [
  {
    id: "lead-1001",
    name: "Michael Turner",
    phone: "(864) 555-0181",
    city: "Anderson, SC",
    project: "Garage Flake System",
    stage: "new",
    notes: "Requested quote from homepage.",
  },
  {
    id: "lead-1002",
    name: "Sarah Jenkins",
    phone: "(864) 555-0114",
    city: "Greenville, SC",
    project: "Metallic Shop Floor",
    stage: "follow_up",
    notes: "Needs call back about color options.",
  },
  {
    id: "lead-1003",
    name: "David Brooks",
    phone: "(864) 555-0138",
    city: "Clemson, SC",
    project: "Patio Recoat",
    stage: "quoted",
    notes: "Quote sent. Waiting on approval.",
  },
  {
    id: "lead-1004",
    name: "Elite Auto Detail",
    phone: "(864) 555-0192",
    city: "Spartanburg, SC",
    project: "Commercial Entry Floor",
    stage: "won",
    notes: "Approved and moving to scheduling.",
  },
];

export default function LeadsPage() {
  const [search, setSearch] = useState("");

  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return mockLeads;

    return mockLeads.filter((lead) =>
      [lead.id, lead.name, lead.phone, lead.city, lead.project, lead.stage, lead.notes]
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [search]);

  const newCount = mockLeads.filter((lead) => lead.stage === "new").length;
  const followUpCount = mockLeads.filter((lead) => lead.stage === "follow_up").length;
  const quotedCount = mockLeads.filter((lead) => lead.stage === "quoted").length;
  const wonCount = mockLeads.filter((lead) => lead.stage === "won").length;

  return (
    <>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>SALES PIPELINE</div>
          <h1 style={titleStyle}>Leads</h1>
          <p style={subtitleStyle}>
            Track incoming leads, follow up faster, and move customers toward approved work.
          </p>
        </div>

        <div style={topActionsStyle}>
          <button style={primaryActionStyle}>New Lead</button>
        </div>
      </div>

      <div style={heroCardStyle}>
        <div style={heroLeftStyle}>
          <div style={heroSmallLabelStyle}>Lead Snapshot</div>
          <div style={heroBigTextStyle}>Keep the pipeline moving.</div>
          <div style={heroTextStyle}>
            Review new inquiries, follow up on warm leads, and keep quotes moving toward sold work.
          </div>
        </div>

        <div style={heroRightStyle}>
          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>NEW</div>
            <div style={miniStatValueStyle}>{newCount}</div>
          </div>

          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>FOLLOW-UP</div>
            <div style={miniStatValueStyle}>{followUpCount}</div>
          </div>

          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>QUOTED</div>
            <div style={miniStatValueStyle}>{quotedCount}</div>
          </div>

          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>WON</div>
            <div style={miniStatValueStyle}>{wonCount}</div>
          </div>
        </div>
      </div>

      <div style={toolbarStyle}>
        <input
          type="text"
          placeholder="Search leads"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      <div style={leadsGridStyle}>
        {filteredLeads.map((lead) => (
          <article key={lead.id} style={leadCardStyle}>
            <div style={leadTopStyle}>
              <div style={leadIdStyle}>Lead ID: {lead.id}</div>
              <div
                style={{
                  ...statusBadgeStyle,
                  ...(lead.stage === "won"
                    ? wonBadgeStyle
                    : lead.stage === "quoted"
                    ? quotedBadgeStyle
                    : lead.stage === "follow_up"
                    ? followUpBadgeStyle
                    : newBadgeStyle),
                }}
              >
                {formatStage(lead.stage)}
              </div>
            </div>

            <div style={leadNameStyle}>{lead.name}</div>
            <div style={leadMetaStyle}>{lead.project}</div>

            <div style={detailsGridStyle}>
              <Info label="Phone" value={lead.phone} />
              <Info label="City" value={lead.city} />
            </div>

            <div style={notesBoxStyle}>
              <div style={notesLabelStyle}>Notes</div>
              <div style={notesTextStyle}>{lead.notes}</div>
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

function formatStage(stage: Lead["stage"]) {
  switch (stage) {
    case "follow_up":
      return "follow-up";
    default:
      return stage;
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

const leadsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "16px",
};

const leadCardStyle: React.CSSProperties = {
  borderRadius: "22px",
  padding: "20px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
};

const leadTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "flex-start",
  marginBottom: "16px",
};

const leadIdStyle: React.CSSProperties = {
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

const newBadgeStyle: React.CSSProperties = {
  color: "#bfe8ff",
  background: "rgba(0, 198, 255, 0.12)",
  border: "1px solid rgba(0, 198, 255, 0.22)",
};

const followUpBadgeStyle: React.CSSProperties = {
  color: "#ffe9b3",
  background: "rgba(255, 191, 0, 0.12)",
  border: "1px solid rgba(255, 191, 0, 0.22)",
};

const quotedBadgeStyle: React.CSSProperties = {
  color: "#ffd3d3",
  background: "rgba(255, 90, 90, 0.12)",
  border: "1px solid rgba(255, 90, 90, 0.22)",
};

const wonBadgeStyle: React.CSSProperties = {
  color: "#bfffd6",
  background: "rgba(52, 199, 89, 0.12)",
  border: "1px solid rgba(52, 199, 89, 0.22)",
};

const leadNameStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  marginBottom: "8px",
};

const leadMetaStyle: React.CSSProperties = {
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
