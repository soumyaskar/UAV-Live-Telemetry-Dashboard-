import React, { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

const MAX_HISTORY = 40;

function KpiCard({ label, value, unit, color, sub }) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      padding: "12px 14px",
      flex: 1,
    }}>
      <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: "6px" }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
        <span style={{ fontSize: "22px", fontWeight: "600", fontFamily: "var(--font-mono)", color: color || "var(--text-primary)" }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>{sub}</div>}
    </div>
  );
}

function MiniChart({ data, dataKey, color, label, domain, referenceVal }) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      padding: "12px 14px 8px",
    }}>
      <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: "8px" }}>
        {label}
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={data} margin={{ top: 2, right: 2, left: -30, bottom: 0 }}>
          <XAxis dataKey="t" hide />
          <YAxis domain={domain || ["auto", "auto"]} tick={{ fontSize: 9, fill: "#4a5a6e" }} width={36} />
          <Tooltip
            contentStyle={{
              background: "#161d2b", border: "1px solid #1e2a3a",
              borderRadius: "6px", fontSize: "11px", color: "#e8edf5",
            }}
            labelFormatter={() => ""}
            formatter={(v) => [typeof v === "number" ? v.toFixed(1) : v, label]}
          />
          {referenceVal && (
            <ReferenceLine y={referenceVal} stroke="#f87171" strokeDasharray="3 3" strokeWidth={1} />
          )}
          <Line
            type="monotone" dataKey={dataKey}
            stroke={color} strokeWidth={1.5}
            dot={false} isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function TelemetryPanel({ drone, onToggle }) {
  const [history, setHistory] = useState([]);
  const tickRef = useRef(0);

  useEffect(() => {
    if (!drone) return;
    tickRef.current += 1;
    const point = {
      t: tickRef.current,
      altitude: parseFloat(drone.altitude.toFixed(1)),
      battery: parseFloat(drone.battery.toFixed(1)),
      speed: parseFloat(drone.speed.toFixed(1)),
      signal: drone.signal,
    };
    setHistory((prev) => [...prev.slice(-MAX_HISTORY + 1), point]);
  }, [drone?.lat]); // update when position changes (each telemetry tick)

  if (!drone) {
    return (
      <div style={{ padding: "24px", color: "var(--text-muted)", textAlign: "center" }}>
        Select a drone to view telemetry
      </div>
    );
  }

  const battColor =
    drone.battery < 20 ? "var(--red)" : drone.battery < 35 ? "var(--amber)" : "var(--green)";
  const sigColor =
    drone.signal < 60 ? "var(--red)" : drone.signal < 75 ? "var(--amber)" : "var(--cyan)";

  const flightMins = Math.floor(drone.flightTime / 75);
  const flightSecs = drone.flightTime % 60;

  return (
    <div style={{
      width: "300px",
      flexShrink: 0,
      background: "var(--bg-surface)",
      borderLeft: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      overflow: "auto",
      padding: "16px",
      gap: "10px",
    }}>
      {/* Header */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "12px 14px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
              {drone.id}
            </div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", margin: "2px 0 4px" }}>
              {drone.name}
            </div>
            <div style={{ fontSize: "11px", color: "var(--cyan)" }}>{drone.missionName}</div>
          </div>
          <button
            onClick={() => onToggle(drone.id)}
            style={{
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "500",
              background: drone.status === "flying" ? "rgba(248,113,113,0.12)" : "rgba(52,211,153,0.12)",
              color: drone.status === "flying" ? "var(--red)" : "var(--green)",
              border: `1px solid ${drone.status === "flying" ? "var(--red)" : "var(--green)"}`,
              transition: "all 0.15s",
            }}
          >
            {drone.status === "flying" ? "Pause" : "Launch"}
          </button>
        </div>
        <div style={{ marginTop: "10px", fontSize: "11px", color: "var(--text-muted)" }}>
          Flight time: <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
            {String(flightMins).padStart(2, "0")}:{String(flightSecs).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "flex", gap: "8px" }}>
        <KpiCard
          label="BATTERY"
          value={Math.round(drone.battery)}
          unit="%"
          color={battColor}
          sub={drone.battery < 20 ? "⚠ Critical" : drone.battery < 35 ? "Low" : "Good"}
        />
        <KpiCard
          label="SIGNAL"
          value={drone.signal}
          unit="%"
          color={sigColor}
        />
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <KpiCard label="ALTITUDE" value={Math.round(drone.altitude)} unit="m" color="var(--blue)" />
        <KpiCard label="SPEED" value={drone.speed} unit="km/h" />
      </div>

      {/* Charts */}
      <MiniChart
        data={history} dataKey="altitude" color="var(--blue)"
        label="ALTITUDE (m)" domain={[0, 250]}
      />
      <MiniChart
        data={history} dataKey="battery" color={battColor}
        label="BATTERY (%)" domain={[0, 100]} referenceVal={20}
      />
      <MiniChart
        data={history} dataKey="speed" color="var(--cyan)"
        label="SPEED (km/h)" domain={[0, 60]}
      />
      <MiniChart
        data={history} dataKey="signal" color="var(--green)"
        label="SIGNAL (%)" domain={[0, 100]} referenceVal={55}
      />

      {/* Coordinates */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "10px 14px",
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
      }}>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: "8px" }}>
          GPS COORDINATES
        </div>
        <div style={{ color: "var(--cyan)", marginBottom: "2px" }}>
          {drone.lat.toFixed(6)}°N
        </div>
        <div style={{ color: "var(--cyan)" }}>
          {drone.lng.toFixed(6)}°E
        </div>
        <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--text-muted)" }}>
          Heading: {drone.heading}°
        </div>
      </div>
    </div>
  );
}
