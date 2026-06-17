const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// ─── MongoDB connection (optional — app works without it) ──────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/uav_dashboard";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(() => console.log("⚠️  MongoDB not connected — flight log saving disabled"));

// ─── Flight Log Schema ─────────────────────────────────────────────────────────
const flightLogSchema = new mongoose.Schema({
  droneId: String,
  timestamp: { type: Date, default: Date.now },
  latitude: Number,
  longitude: Number,
  altitude: Number,
  speed: Number,
  battery: Number,
  signal: Number,
  status: String,
});
const FlightLog = mongoose.model("FlightLog", flightLogSchema);

// ─── Drone State ───────────────────────────────────────────────────────────────
// 3 drones flying different paths around Bhubaneswar, Odisha
const drones = {
  "DRONE-01": {
    id: "DRONE-01",
    name: "Hawk Alpha",
    lat: 20.2961,
    lng: 85.8245,
    altitude: 120,
    speed: 0,
    battery: 92,
    signal: 97,
    status: "flying",
    heading: 45,
    missionName: "City Perimeter Survey",
    flightTime: 0,
    path: [],
  },
  "DRONE-02": {
    id: "DRONE-02",
    name: "Hawk Beta",
    lat: 20.3001,
    lng: 85.8180,
    altitude: 85,
    speed: 0,
    battery: 78,
    signal: 89,
    status: "flying",
    heading: 120,
    missionName: "Infrastructure Inspection",
    flightTime: 0,
    path: [],
  },
  "DRONE-03": {
    id: "DRONE-03",
    name: "Hawk Gamma",
    lat: 20.2920,
    lng: 85.8300,
    altitude: 0,
    speed: 0,
    battery: 100,
    signal: 95,
    status: "idle",
    heading: 0,
    missionName: "Standby",
    flightTime: 0,
    path: [],
  },
};

// Alert log (in-memory)
const alerts = [];

function addAlert(droneId, type, message) {
  const alert = {
    id: Date.now(),
    droneId,
    type, // 'warning' | 'critical' | 'info'
    message,
    timestamp: new Date().toISOString(),
  };
  alerts.unshift(alert);
  if (alerts.length > 50) alerts.pop();
  io.emit("alert", alert);
}

// ─── Telemetry Simulation ──────────────────────────────────────────────────────
function simulateTelemetry() {
  Object.values(drones).forEach((drone) => {
    if (drone.status === "idle") return;

    // Movement
    const latDelta = (Math.random() - 0.5) * 0.0008;
    const lngDelta = (Math.random() - 0.5) * 0.0008;
    drone.lat = parseFloat((drone.lat + latDelta).toFixed(6));
    drone.lng = parseFloat((drone.lng + lngDelta).toFixed(6));

    // Altitude drift
    drone.altitude = parseFloat(
      Math.max(50, Math.min(200, drone.altitude + (Math.random() - 0.5) * 4)).toFixed(1)
    );

    // Speed
    const distKm = Math.sqrt(latDelta ** 2 + lngDelta ** 2) * 111;
    drone.speed = parseFloat((distKm * 3600 * 2).toFixed(1)); // km/h approx

    // Battery drain
    drone.battery = parseFloat(Math.max(0, drone.battery - 0.03).toFixed(1));

    // Signal fluctuation
    drone.signal = Math.max(
      40,
      Math.min(100, drone.signal + Math.floor((Math.random() - 0.5) * 4))
    );

    // Flight time
    drone.flightTime += 1;

    // Keep path last 60 points
    drone.path.push({ lat: drone.lat, lng: drone.lng });
    if (drone.path.length > 60) drone.path.shift();

    // Alerts
    if (drone.battery <= 20 && drone.battery > 19.9) {
      addAlert(drone.id, "critical", `${drone.name}: Battery critical — ${drone.battery}%`);
    } else if (drone.battery <= 30 && drone.battery > 29.9) {
      addAlert(drone.id, "warning", `${drone.name}: Battery low — ${drone.battery}%`);
    }
    if (drone.signal < 55 && Math.random() > 0.85) {
      addAlert(drone.id, "warning", `${drone.name}: Weak signal — ${drone.signal}%`);
    }

    // Auto-land at 5% battery
    if (drone.battery <= 5) {
      drone.status = "returning";
      addAlert(drone.id, "critical", `${drone.name}: Auto-return triggered — battery critical`);
    }
  });

  io.emit("telemetry", Object.values(drones));
}

// Emit every 800ms
setInterval(simulateTelemetry, 800);

// ─── REST API ──────────────────────────────────────────────────────────────────
app.get("/api/drones", (req, res) => {
  res.json(Object.values(drones));
});

app.get("/api/alerts", (req, res) => {
  res.json(alerts);
});

app.get("/api/logs", async (req, res) => {
  try {
    const { droneId, limit = 50 } = req.query;
    const query = droneId ? { droneId } : {};
    const logs = await FlightLog.find(query).sort({ timestamp: -1 }).limit(Number(limit));
    res.json(logs);
  } catch {
    res.json([]);
  }
});

// Save a flight snapshot to MongoDB
app.post("/api/logs", async (req, res) => {
  try {
    const log = new FlightLog(req.body);
    await log.save();
    res.json({ success: true, id: log._id });
  } catch (err) {
    res.status(500).json({ error: "Could not save log" });
  }
});

// Toggle drone status
app.post("/api/drones/:id/toggle", (req, res) => {
  const drone = drones[req.params.id];
  if (!drone) return res.status(404).json({ error: "Drone not found" });
  drone.status = drone.status === "idle" ? "flying" : "idle";
  if (drone.status === "flying") {
    addAlert(drone.id, "info", `${drone.name}: Mission started`);
  } else {
    addAlert(drone.id, "info", `${drone.name}: Mission paused`);
  }
  res.json({ status: drone.status });
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

// ─── Socket.io Connection ──────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`📡 Client connected: ${socket.id}`);

  // Send current state immediately on connect
  socket.emit("telemetry", Object.values(drones));
  socket.emit("alerts_history", alerts.slice(0, 10));

  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ─── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 UAV Telemetry Server running on http://localhost:${PORT}`);
});
