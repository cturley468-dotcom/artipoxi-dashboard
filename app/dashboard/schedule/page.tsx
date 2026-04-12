"use client";

import { useMemo, useState } from "react";

type ScheduleItem = {
  id: string;
  customer: string;
  location: string;
  installer: string;
  date: string;
  time: string;
  status: "scheduled" | "confirmed" | "needs_follow_up";
  system: string;
};

const mockSchedule: ScheduleItem[] = [
  {
    id: "sch-1001",
    customer: "Anderson Garage Coating",
    location: "Anderson, SC",
    installer: "Crew A",
    date: "2026-04-14",
    time: "8:00 AM",
    status: "confirmed",
    system: "Flake System",
  },
  {
    id: "sch-1002",
    customer: "Premium Shop Floor",
    location: "Greenville, SC",
    installer: "Crew B",
    date: "2026-04-15",
    time: "9:30 AM",
    status: "scheduled",
    system: "Metallic Resin",
  },
  {
    id: "sch-1003",
    customer: "Patio Recoat Project",
    location: "Clemson, SC",
    installer: "Crew A",
    date: "2026-04-16",
    time: "10:00 AM",
    status: "needs_follow_up",
    system: "Solid Color Epoxy",
  },
  {
    id: "sch-1004",
    customer: "Commercial Entry Floor",
    location: "Spartanburg, SC",
    installer: "Crew C",
    date: "2026-04-17",
    time: "7:30 AM",
    status: "scheduled",
    system: "Commercial Flake",
  },
];

export default function SchedulePage() {
  const [search, setSearch] = useState("");

  const filteredSchedule = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return mockSchedule;

    return mockSchedule.filter((item) =>
      [
        item.id,
        item.customer,
        item.location,
        item.installer,
        item.date,
        item.time,
        item.status,
        item.system,
      ].some((value) => value.toLowerCase().includes(term))
    );
  }, [search]);

  const scheduledCount = mockSchedule.filter((item) => item.status === "scheduled").length;
  const confirmedCount = mockSchedule.filter((item) => item.status === "confirmed").length;
  const followUpCount = mockSchedule.filter((item) => item.status === "needs_follow_up").length;
  const thisWeekCount = mockSchedule.length;

  return (
    <>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>INSTALL PLANNING</div>
          <h1 style={titleStyle}>Schedule</h1>
          <p style={subtitleStyle}>
            Keep installs organized, confirm assignments, and manage upcoming work.
          </p>
        </div>

        <div style={topActionsStyle}>
          <button style={primaryActionStyle}>New Assignment</button>
        </div>
      </div>

      <div style={heroCardStyle}>
        <div style={heroLeftStyle}>
          <div style={heroSmallLabelStyle}>Schedule Snapshot</div>
          <div style={heroBigTextStyle}>Keep install days locked in.</div>
          <div style={heroTextStyle}>
            Review scheduled jobs, confirm crews, and keep the production calendar
            moving smoothly.
          </div>
        </div>

        <div style={heroRightStyle}>
          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>THIS WEEK</div>
            <div style={miniStatValueStyle}>{thisWeekCount}</div>
          </div>

          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>CONFIRMED</div>
            <div style={miniStatValueStyle}>{confirmedCount}</div>
          </div>

          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>SCHEDULED</div>
            <div style={miniStatValueStyle}>{scheduledCount}</div>
          </div>

          <div style={miniStatStyle}>
            <div style={miniStatLabelStyle}>FOLLOW-UP</div>
            <div style={miniStatValueStyle}>{followUpCount}</div>
          </div>
        </div>
      </div>

      <div style={toolbarStyle}>
        <input
          type="text"
          placeholder="Search schedule"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      <div style={scheduleGridStyle}>
        {filteredSchedule.map((item) => (
          <article key={item.id} style={scheduleCardStyle}>
            <div style={scheduleTopStyle}>
              <div style={scheduleIdStyle}>Schedule ID: {item.id}</div>
              <div
                style={{
                  ...statusBadgeStyle,
                  ...(item.status === "confirmed"
                    ? confirmedBadgeStyle
                    : item.status === "needs_follow_up"
                    ? followUpBadgeStyle
                    : scheduledBadgeStyle),
                }}
              >
                {formatStatus(item.status)}
              </div>
            </div>

            <div style={scheduleTitleStyle}>{item.customer}</div>
            <div style={scheduleMetaStyle}>{item.location}</div>

            <div style={detailsGridStyle}>
              <Info label="Installer" value={item.installer} />
              <Info label="System" value={item.system} />
              <Info label="Date" value={item.date} />
              <Info label="Time" value={item.time} />
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

function formatStatus(status: ScheduleItem["status"]) {
  switch (status) {
    case "needs_follow_up":
      return "needs follow-up";
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

const scheduleGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "16px",
};

const scheduleCardStyle: React.CSSProperties = {
  borderRadius: "22px",
  padding: "20px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
};

const scheduleTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "flex-start",
  marginBottom: "16px",
};

const scheduleIdStyle: React.CSSProperties = {
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

const scheduledBadgeStyle: React.CSSProperties = {
  color: "#bfe8ff",
  background: "rgba(0, 198, 255, 0.12)",
  border: "1px solid rgba(0, 198, 255, 0.22)",
};

const confirmedBadgeStyle: React.CSSProperties = {
  color: "#bfffd6",
  background: "rgba(52, 199, 89, 0.12)",
  border: "1px solid rgba(52, 199, 89, 0.22)",
};

const followUpBadgeStyle: React.CSSProperties = {
  color: "#ffe9b3",
  background: "rgba(255, 191, 0, 0.12)",
  border: "1px solid rgba(255, 191, 0, 0.22)",
};

const scheduleTitleStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  marginBottom: "8px",
};

const scheduleMetaStyle: React.CSSProperties = {
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
