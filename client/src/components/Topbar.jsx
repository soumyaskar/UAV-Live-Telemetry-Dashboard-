import React from "react";

const styles = {
  bar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    height: "52px",
    background: "var(--bg-surface)",
    borderBottom: "1px solid var(--border)",
    flexShrink: 0,
  },
  left: { display: "flex", alignItems: "center", gap: "12px" },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  logoIcon: {
    width: "28px",
    height: "28px",
    background: "var(--cyan)",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: "15px",
    fontWeight: "600",
    color: "var(--text-primary)",
    letterSpacing: "-0.01em",
  },
  logoSub: {
    fontSize: "11px",
    color: "var(--text-muted)",
    fontFamily: "var(--font-mono)",
    marginLeft: "4px",
  },
  divider: {
    width: "1px",
    height: "20px",
    background: "var(--border)",
    margin: "0 4px",
  },
  time: {
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    color: "var(--text-secondary)",
  },
  right: { display: "flex", alignItems: "center", gap: "16px" },
  status: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
  },
  dot: (connected) => ({
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: connected ? "var(--green)" : "var(--red)",
    boxShadow: connected ? "0 0 6px var(--green)" : "none",
    animation: connected ? "pulse 2s infinite" : "none",
  }),
  badge: {
    fontSize: "11px",
    fontFamily: "var(--font-mono)",
    color: "var(--text-muted)",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    padding: "2px 8px",
  },
};

function DroneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0b0e14" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M3 3l4 4M17 3l-4 4M3 21l4-4M17 21l-4-4" />
      <path d="M3 3h4v4M17 3h-4v4M3 21h4v-4M17 21h-4v-4" />
    </svg>
  );
}

export default function Topbar({ connected, activeDrones }) {
  const [time, setTime] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      <header style={styles.bar}>
        <div style={styles.left}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}><DroneIcon /></div>
            <span style={styles.logoText}>UAV Command</span>
            <span style={styles.logoSub}>TELEMETRY v1.0</span>
          </div>
          <div style={styles.divider} />
          <span style={styles.time}>{time.toUTCString().slice(17, 25)} UTC</span>
        </div>
        <div style={styles.right}>
          <span style={styles.badge}>{activeDrones} DRONE{activeDrones !== 1 ? "S" : ""} ACTIVE</span>
          <div style={styles.status}>
            <div style={styles.dot(connected)} />
            <span style={{ color: connected ? "var(--green)" : "var(--red)", fontSize: "12px" }}>
              {connected ? "Live Feed" : "Disconnected"}
            </span>
          </div>
        </div>
      </header>
    </>
  );
}
