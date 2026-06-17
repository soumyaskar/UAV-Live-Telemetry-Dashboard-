import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001";

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [drones, setDrones] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ["websocket"] });

    socketRef.current.on("connect", () => setConnected(true));
    socketRef.current.on("disconnect", () => setConnected(false));

    socketRef.current.on("telemetry", (data) => setDrones(data));

    socketRef.current.on("alert", (alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 30));
    });

    socketRef.current.on("alerts_history", (history) => {
      setAlerts(history);
    });

    return () => socketRef.current?.disconnect();
  }, []);

  return { connected, drones, alerts };
}
