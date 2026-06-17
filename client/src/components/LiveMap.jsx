import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function droneIcon(status, isSelected) {
  const color =
    status === "flying" ? "#22d3ee"
    : status === "returning" ? "#fbbf24"
    : "#7a8ba0";
  const size = isSelected ? 38 : 30;

  return L.divIcon({
    html: `
      <div style="
        width:${size}px; height:${size}px;
        display:flex; align-items:center; justify-content:center;
        background:${color}22; border:2px solid ${color};
        border-radius:50%; position:relative;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M3 3l4 4M17 3l-4 4M3 21l4-4M17 21l-4-4"/>
          <path d="M3 3h4v4M17 3h-4v4M3 21h4v-4M17 21h-4v-4"/>
        </svg>
        ${isSelected ? `<div style="position:absolute;inset:-6px;border:1.5px solid ${color}44;border-radius:50%;animation:ping 1.5s infinite;"></div>` : ""}
      </div>
      <style>@keyframes ping{0%{transform:scale(1);opacity:0.6}100%{transform:scale(1.5);opacity:0}}</style>
    `,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.panTo([lat, lng], { animate: true, duration: 0.8 });
  }, [lat, lng]);
  return null;
}

const DRONE_COLORS = {
  "DRONE-01": "#22d3ee",
  "DRONE-02": "#a78bfa",
  "DRONE-03": "#34d399",
};

export default function LiveMap({ drones, selectedId }) {
  const selected = drones.find((d) => d.id === selectedId) || drones[0];
  if (!selected) return null;

  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      <style>{`
        .leaflet-container { background: #0d1117; height: 100%; }
        .leaflet-tile { filter: brightness(0.7) saturate(0.6); }
        .leaflet-popup-content-wrapper {
          background: #161d2b; color: #e8edf5; border: 1px solid #1e2a3a;
          border-radius: 8px; font-family: "Inter", sans-serif; font-size: 13px;
        }
        .leaflet-popup-tip { background: #161d2b; }
        .leaflet-control-zoom a {
          background: #161d2b !important; color: #e8edf5 !important;
          border-color: #1e2a3a !important;
        }
        .leaflet-control-attribution { background: rgba(11,14,20,0.7) !important; color: #4a5a6e !important; }
        .leaflet-control-attribution a { color: #4a5a6e !important; }
      `}</style>

      <MapContainer
        center={[selected.lat, selected.lng]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap'
        />

        {drones.map((drone) => (
          <React.Fragment key={drone.id}>
            {/* Flight path */}
            {drone.path && drone.path.length > 1 && (
              <Polyline
                positions={drone.path.map((p) => [p.lat, p.lng])}
                color={DRONE_COLORS[drone.id] || "#22d3ee"}
                weight={2}
                opacity={0.55}
                dashArray={drone.status === "idle" ? "4 6" : null}
              />
            )}

            {/* Drone marker */}
            <Marker
              position={[drone.lat, drone.lng]}
              icon={droneIcon(drone.status, drone.id === selectedId)}
            >
              <Popup>
                <div style={{ minWidth: "160px" }}>
                  <div style={{ fontWeight: 600, marginBottom: "8px", color: DRONE_COLORS[drone.id] }}>
                    {drone.name}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px", fontSize: "12px" }}>
                    <span style={{ color: "#7a8ba0" }}>Altitude</span><span>{Math.round(drone.altitude)}m</span>
                    <span style={{ color: "#7a8ba0" }}>Speed</span><span>{drone.speed} km/h</span>
                    <span style={{ color: "#7a8ba0" }}>Battery</span><span>{Math.round(drone.battery)}%</span>
                    <span style={{ color: "#7a8ba0" }}>Signal</span><span>{drone.signal}%</span>
                    <span style={{ color: "#7a8ba0" }}>Lat</span><span>{drone.lat.toFixed(4)}</span>
                    <span style={{ color: "#7a8ba0" }}>Lng</span><span>{drone.lng.toFixed(4)}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}

        {selected && <MapRecenter lat={selected.lat} lng={selected.lng} />}
      </MapContainer>

      {/* Map overlay — selected drone quick stats */}
      {selected && (
        <div style={{
          position: "absolute", bottom: "16px", left: "16px", zIndex: 1000,
          background: "rgba(11,14,20,0.88)", backdropFilter: "blur(8px)",
          border: "1px solid var(--border-light)", borderRadius: "10px",
          padding: "12px 16px", minWidth: "200px",
        }}>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "6px", letterSpacing: "0.08em" }}>
            TRACKING — {selected.id}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px" }}>
            {[
              ["Lat", selected.lat.toFixed(5)],
              ["Lng", selected.lng.toFixed(5)],
              ["Alt", `${Math.round(selected.altitude)}m`],
              ["Spd", `${selected.speed} km/h`],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{k}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--cyan)" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
