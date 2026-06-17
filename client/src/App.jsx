import React, { useState } from "react";
import Topbar from "./components/Topbar";
import DroneSidebar from "./components/DroneSidebar";
import LiveMap from "./components/LiveMap";
import TelemetryPanel from "./components/TelemetryPanel";
import AlertFeed from "./components/AlertFeed";
import { useSocket } from "./hooks/useSocket";

async function toggleDrone(id) {
  await fetch(`/api/drones/${id}/toggle`, { method: "POST" });
}

export default function App() {
  const { connected, drones, alerts } = useSocket();
  const [selectedId, setSelectedId] = useState("DRONE-01");

  const selectedDrone = drones.find((d) => d.id === selectedId) || drones[0];
  const activeDrones = drones.filter((d) => d.status === "flying").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Topbar connected={connected} activeDrones={activeDrones} />

      {/* Alert banner */}
      <div style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          height: "32px",
          gap: "8px",
          borderBottom: "1px solid var(--border)",
        }}>
          <span style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-muted)", letterSpacing: "0.1em" }}>
            ALERTS
          </span>
          {alerts.length > 0 && (
            <span style={{
              fontSize: "10px", fontWeight: "600",
              background: "var(--red)", color: "white",
              borderRadius: "10px", padding: "0 6px", lineHeight: "16px",
            }}>
              {alerts.length}
            </span>
          )}
        </div>
        <AlertFeed alerts={alerts} />
      </div>

      {/* Main layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <DroneSidebar
          drones={drones}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <LiveMap drones={drones} selectedId={selectedId} />

        <TelemetryPanel
          drone={selectedDrone}
          onToggle={toggleDrone}
        />
      </div>
    </div>
  );
}
