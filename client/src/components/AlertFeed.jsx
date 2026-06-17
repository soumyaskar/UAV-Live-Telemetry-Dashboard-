import React from "react";

const TYPE_STYLE = {
  critical: { color: "var(--red)", bg: "rgba(248,113,113,0.08)", icon: "⚠" },
  warning:  { color: "var(--amber)", bg: "rgba(251,191,36,0.08)", icon: "▲" },
  info:     { color: "var(--cyan)", bg: "rgba(34,211,238,0.06)", icon: "●" },
};

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  return `${Math.round(diff / 3600)}h ago`;
}

export default function AlertFeed({ alerts }) {
  if (!alerts.length) {
    return (
      <div style={{
        padding: "10px 16px",
        fontSize: "12px",
        color: "var(--text-muted)",
        fontStyle: "italic",
      }}>
        No alerts — all systems nominal
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1px", maxHeight: "160px", overflowY: "auto" }}>
      {alerts.map((a) => {
        const t = TYPE_STYLE[a.type] || TYPE_STYLE.info;
        return (
          <div
            key={a.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              padding: "7px 16px",
              background: t.bg,
              borderLeft: `2px solid ${t.color}`,
              fontSize: "12px",
            }}
          >
            <span style={{ color: t.color, flexShrink: 0, marginTop: "1px" }}>{t.icon}</span>
            <span style={{ color: "var(--text-secondary)", flex: 1, lineHeight: "1.4" }}>{a.message}</span>
            <span style={{ color: "var(--text-muted)", flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "10px" }}>
              {timeAgo(a.timestamp)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
