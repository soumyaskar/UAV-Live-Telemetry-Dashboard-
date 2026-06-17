# 🛸 UAV Live Telemetry Dashboard

A real-time drone monitoring system built with **React**, **Node.js**, **Socket.io**, and **MongoDB**.
Developed as part of work at **Jaywings Technologies** (AIC Nalanda).

![Tech Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js)
![Socket.io](https://img.shields.io/badge/Socket.io-4.6-010101?logo=socket.io)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?logo=mongodb)

---

## 🔴 Live Demo

> **[https://uav-dashboard.onrender.com](https://uav-dashboard.onrender.com)**
> *(Replace with your deployed URL)*

---

## ✨ Features

- **Real-time telemetry** — GPS coordinates, altitude, speed, battery, signal streamed via WebSockets every 800ms
- **Live map** — Drone positions and flight paths on OpenStreetMap (Leaflet.js)
- **Multi-drone fleet** — Monitor 3 drones simultaneously, switch focus between them
- **Live charts** — Altitude, battery, speed, signal history with Recharts
- **Smart alerts** — Auto-warnings for low battery (< 30%) and weak signal (< 55%)
- **Auto-return** — Drone enters "returning" mode when battery hits 5%
- **Mission control** — Pause/launch individual drones from the UI
- **Flight logs** — Persistent storage of telemetry snapshots in MongoDB
- **Responsive** — Works on desktop and tablet

---

## 🛠 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, Vite, React-Leaflet, Recharts |
| Backend     | Node.js, Express.js                 |
| Real-time   | Socket.io (WebSockets)              |
| Database    | MongoDB + Mongoose                  |
| Maps        | Leaflet.js + OpenStreetMap          |
| Deployment  | Vercel (client) + Render (server)   |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/uav-telemetry-dashboard.git
cd uav-telemetry-dashboard

# Install all dependencies
npm run install:all
```

### Environment Variables

Create `server/.env`:
```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/uav_dashboard
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/uav_dashboard
```

### Run in Development

```bash
npm install          # install concurrently
npm run dev          # starts both server (3001) and client (5173)
```

Then open **http://localhost:5173**

---

## 📁 Project Structure

```
uav-telemetry-dashboard/
├── server/
│   ├── index.js          # Express + Socket.io server, telemetry simulator
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.jsx                      # Root component
│   │   ├── hooks/
│   │   │   └── useSocket.js             # Socket.io real-time hook
│   │   └── components/
│   │       ├── Topbar.jsx               # Header with connection status
│   │       ├── DroneSidebar.jsx         # Fleet list + battery bars
│   │       ├── LiveMap.jsx              # Leaflet map with drone markers
│   │       ├── TelemetryPanel.jsx       # KPI cards + live charts
│   │       └── AlertFeed.jsx            # Real-time alert log
│   ├── index.html
│   └── package.json
└── package.json           # Root scripts (concurrently)
```

---

## 🌐 Deployment

### Backend → Render (free tier)
1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo → set root dir to `server`
4. Build command: `npm install` | Start: `node index.js`
5. Add env variable: `MONGO_URI` (use MongoDB Atlas)

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect repo → set root dir to `client`
3. Add env: `VITE_SERVER_URL=https://your-render-url.onrender.com`
4. Update `useSocket.js` to use `import.meta.env.VITE_SERVER_URL`

---

## 📸 Screenshots

> Add screenshots here after running the app — the map with drone trails
> and the live telemetry panel make great visuals for your portfolio.

---

## 👩‍💻 Author

**Soumya Sanghamitra Kar**
- GitHub: [@soumyaskar](https://github.com/soumyaskar)
- LinkedIn: [soumyasanghamitra-kar](https://linkedin.com/in/soumyasanghamitra-kar)

Built as part of the internship application for demonstrating real-world
UAV telemetry visualization work done at Jaywings Technologies, AIC Nalanda.
