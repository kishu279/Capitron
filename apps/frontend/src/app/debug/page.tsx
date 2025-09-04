// WHAT THIS DO
// 1. Create a WebSocket connection
// 2. Handle WebSocket Connections
// 3. Handles the error and close events along with cleanup

"use client";

import React, { useEffect, useState } from "react";

const webSocketLink = "ws://localhost:8080";

export default function page() {
  const [loading, setLoading] = useState<boolean>(false);
  const [socketConnection, setSocketConnection] = useState<WebSocket | null>(
    null
  );

  useEffect(() => {
    let connection: WebSocket | null = null;
    setSocketConnection(connection);

    try {
      connection = new WebSocket(webSocketLink);

      connection.onopen = () => {
        setLoading(false);
        connection?.send("Hello from client");
        console.log("WebSocket connection opened");
      };

      connection.onmessage = (event) => {
        console.log("Received message from server:", event.data);
      };

      connection.onclose = () => {
        console.log("WebSocket connection closed");
      };

      connection.onerror = (error) => {
        console.error("WebSocket connection error:", error);
      };
    } catch (error) {
      console.error(error);
    }

    return () => {
      // if open then close to cleanup the function
      if (connection && connection.readyState === WebSocket.OPEN) {
        connection.close();
      }
      setSocketConnection(null);
    };
  }, []);

  return <div className="text-3xl">DEBUG</div>;
}
