import React from "react";

const s = {
  sidebar: {
    width: "220px",
    flexShrink: 0,
    background: "var(--bg-surface)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  label: {
    padding: "14px 16px 8px",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.1em",
    color: "var(--text-muted)",
    textTransform: "uppercase",
  },
  card: (selected) => ({
    margin: "0 8px 4px",
    padding: "12px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    background: selected ? "var(--bg-hover)" : "transparent",
    border: selected ? "1px solid var(--border-light)" : "1px solid transparent",
    transition: "all 0.15s",
  }),
  droneId: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--text-muted)",
    marginBottom: "2px",
  },
  droneName: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--text-primary)",
    marginBottom: "8px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "6px",
  },
  statusBadge: (status) => ({
    fontSize: "10px",
    fontWeight: "500",
    padding: "2px 7px",
    borderRadius: "4px",
    background:
      status === "flying" ? "rgba(52,211,153,0.12)"
      : status === "returning" ? "rgba(251,191,36,0.12)"
      : "rgba(122,139,160,0.12)",
    color:
      status === "flying" ? "var(--green)"
      : status === "returning" ? "var(--amber)"
      : "var(--text-secondary)",
  }),
  battery: (pct) => ({
    fontSize: "11px",
    fontFamily: "var(--font-mono)",
    color: pct < 20 ? "var(--red)" : pct < 35 ? "var(--amber)" : "var(--green)",
  }),
  bbar: {
    width: "100%",
    height: "3px",
    borderRadius: "2px",
    background: "var(--border)",
    marginTop: "6px",
    overflow: "hidden",
  },
  bfill: (pct) => ({
    height: "100%",
    width: `${pct}%`,
    borderRadius: "2px",
    background: pct < 20 ? "var(--red)" : pct < 35 ? "var(--amber)" : "var(--green)",
    transition: "width 0.6s ease",
  }),
  divider: {
    height: "1px",
    background: "var(--border)",
    margin: "8px 0",
  },
  statsSection: {
    padding: "0 16px 16px",
    marginTop: "auto",
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid var(--border)",
  },
  statLabel: { fontSize: "11px", color: "var(--text-muted)" },
  statVal: { fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-primary)" },
};

export default function DroneSidebar({ drones, selectedId, onSelect }) {
  const flying = drones.filter((d) => d.status === "flying").length;
  const avgBattery =
    drones.length > 0
      ? Math.round(drones.reduce((a, d) => a + d.battery, 0) / drones.length)
      : 0;

  return (
    <aside style={s.sidebar}>
      <div style={s.label}>Fleet — {drones.length} drones</div>

      {drones.map((drone) => (
        <div key={drone.id} style={s.card(drone.id === selectedId)} onClick={() => onSelect(drone.id)}>
          <div style={s.droneId}>{drone.id}</div>
          <div style={s.droneName}>{drone.name}</div>
          <div style={s.row}>
            <span style={s.statusBadge(drone.status)}>{drone.status.toUpperCase()}</span>
            <span style={s.battery(drone.battery)}>{Math.round(drone.battery)}%</span>
          </div>
          <div style={s.bbar}>
            <div style={s.bfill(drone.battery)} />
          </div>
        </div>
      ))}

      <div style={s.divider} />

      <div style={s.statsSection}>
        <div style={s.label}>Fleet summary</div>
        <div style={s.statRow}>
          <span style={s.statLabel}>Active</span>
          <span style={s.statVal}>{flying} / {drones.length}</span>
        </div>
        <div style={s.statRow}>
          <span style={s.statLabel}>Avg battery</span>
          <span style={{ ...s.statVal, color: avgBattery < 30 ? "var(--amber)" : "var(--text-primary)" }}>
            {avgBattery}%
          </span>
        </div>
        <div style={s.statRow}>
          <span style={s.statLabel}>Data rate</span>
          <span style={s.statVal}>800ms</span>
        </div>
      </div>
    </aside>
  );
}
