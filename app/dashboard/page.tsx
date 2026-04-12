"use client";

export default function DashboardPage() {
  return (
    <>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>CONTROL CENTER</div>
          <h1 style={titleStyle}>Dashboard</h1>
          <p style={subtitleStyle}>
            Track jobs, scheduling, leads, and business activity from one clean control center.
          </p>
        </div>

        <div style={topActionsStyle}>
          <a href="/dashboard/jobs" style={primaryActionStyle}>
            Open Jobs
          </a>
          <a href="/configurator" style={secondaryActionStyle}>
            Configurator
          </a>
        </div>
      </div>

      <div style={heroCardStyle}>
        <div style={heroLeftStyle}>
          <div style={heroSmallLabelStyle}>Business Snapshot</div>
          <div style={heroBigTextStyle}>Everything important, one view.</div>
          <div style={heroTextStyle}>
            Keep your sales pipeline, install schedule, revenue targets, and active
            work moving in one place.
          </div>

          <div style={heroButtonsStyle}>
            <a href="/dashboard/leads" style={primaryActionStyle}>
              View Leads
            </a>
            <a href="/dashboard/schedule" style={secondaryActionStyle}>
              Open Schedule
            </a>
          </div>
        </div>

        <div style={heroRightStyle}>
          <div style={miniCardStyle}>
            <div style={miniCardLabelStyle}>FOCUS</div>
            <div style={miniCardValueStyle}>3 installs this week</div>
          </div>

          <div style={miniCardStyle}>
            <div style={miniCardLabelStyle}>NEXT TARGET</div>
            <div style={miniCardValueStyle}>Close 5 open leads</div>
          </div>
        </div>
      </div>

      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Projected Revenue</div>
          <div style={statValueStyle}>$24,500</div>
          <div style={statDetailStyle}>+12% this month</div>
        </div>

        <div style={statCardStyle}>
          <div style={statLabelStyle}>Active Jobs</div>
          <div style={statValueStyle}>8</div>
          <div style={statDetailStyle}>3 installs this week</div>
        </div>

        <div style={statCardStyle}>
          <div style={statLabelStyle}>Open Leads</div>
          <div style={statValueStyle}>13</div>
          <div style={statDetailStyle}>5 need follow-up</div>
        </div>

        <div style={statCardStyle}>
          <div style={statLabelStyle}>Work Orders</div>
          <div style={statValueStyle}>21</div>
          <div style={statDetailStyle}>7 ready to schedule</div>
        </div>
      </div>
    </>
  );
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
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 16px",
  borderRadius: "14px",
  fontWeight: 700,
  color: "#031019",
  background: "linear-gradient(135deg, rgba(0,212,255,0.95), rgba(0,140,255,0.9))",
};

const secondaryActionStyle: React.CSSProperties = {
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 16px",
  borderRadius: "14px",
  fontWeight: 700,
  color: "white",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.05)",
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

const heroButtonsStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "18px",
};

const heroRightStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
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
  fontSize: "28px",
  fontWeight: 700,
};

const statsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

const statCardStyle: React.CSSProperties = {
  borderRadius: "22px",
  padding: "20px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
};

const statLabelStyle: React.CSSProperties = {
  color: "rgba(216,238,255,0.66)",
  fontSize: "12px",
  marginBottom: "10px",
};

const statValueStyle: React.CSSProperties = {
  fontSize: "34px",
  fontWeight: 700,
};

const statDetailStyle: React.CSSProperties = {
  marginTop: "10px",
  color: "#9fe8ff",
  fontSize: "14px",
};
