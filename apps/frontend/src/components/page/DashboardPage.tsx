"use client";

import React, { useEffect, useState } from "react";
import NavBar from "../sections/navbar";
import Sidebar from "../sections/sidebar";
import LiveTrades from "../sections/live-trades";

const webSocketServerLink = "ws://localhost:8080";

const sampleSidebarOptions = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    onClick: () => console.log("Dashboard clicked"),
  },
  {
    id: "trading",
    label: "Trading",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
    children: [
      {
        id: "spot-trading",
        label: "Spot Trading",
        onClick: () => console.log("Spot Trading clicked"),
      },
      {
        id: "futures-trading",
        label: "Futures Trading",
        onClick: () => console.log("Futures Trading clicked"),
      },
      {
        id: "options-trading",
        label: "Options Trading",
        onClick: () => console.log("Options Trading clicked"),
      },
    ],
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    badge: "3",
    onClick: () => console.log("Portfolio clicked"),
  },
  {
    id: "markets",
    label: "Markets",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
        />
      </svg>
    ),
    onClick: () => console.log("Markets clicked"),
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    children: [
      {
        id: "performance",
        label: "Performance",
        onClick: () => console.log("Performance clicked"),
      },
      {
        id: "reports",
        label: "Reports",
        badge: "2",
        onClick: () => console.log("Reports clicked"),
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    onClick: () => console.log("Settings clicked"),
  },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectOption, setSelectOption] = useState("dashboard");
  const [connection, setConn] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");

  useEffect(() => {
    let wsConnection: WebSocket | null = null;

    try {
      setConnectionStatus("connecting");
      wsConnection = new WebSocket(webSocketServerLink); // create a new connection

      // EVENTS
      wsConnection.onopen = () => {
        console.log("websocket connection opened");
        setConn(wsConnection); // Store the connection in state
        setConnectionStatus("connected");

        // first join and then broadcast the message
        const data = { type: "join" };
        wsConnection?.send(JSON.stringify(data));
      };

      wsConnection.onclose = () => {
        console.log("websocket connection closed");
        setConn(null); // Clear the connection from state
        setConnectionStatus("disconnected");

        // send the send the trade
        wsConnection?.send(JSON.stringify({ type: "trade_data" }));
      };

      // wsConnection.onmessage = (event) => {
      //   // const data = JSON.parse(event.data);
      //   console.log("Received message from server:", event.data);
      // };

      wsConnection.onerror = (error) => {
        console.error("websocket connection error:", error);
        setConn(null); // Clear the connection from state on error
        setConnectionStatus("error");
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      setConn(null);
      setConnectionStatus("error");
    }

    return () => {
      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.close();
        console.log("WebSocket connection closed");
      }
      setConn(null);
      setConnectionStatus("disconnected");
    };
  }, []);

  const sidebarOptions = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      onClick: () => setSelectOption("dashboard"),
    },
    {
      id: "trading",
      label: "Trading",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      children: [
        {
          id: "live-trades",
          label: "Live Trades",
          onClick: () => setSelectOption("live-trades"),
        },
        {
          id: "candlestick-trades-ohlc",
          label: "candlestick-trades-ohlc",
          onClick: () => setSelectOption("candlestick-trades-ohlc"),
        },
      ],
    },
  ];

  // get the data from the web socket

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-full ">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          options={sidebarOptions}
          title="Capitron"
          isActive={selectOption}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full min-h-screen">
          {/* Navbar with menu button */}
          <div className="bg-white shadow-sm">
            <div className="flex items-center px-4 lg:px-6">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Navbar content */}
              <div className="flex-1">
                <NavBar />
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                {selectOption === "dashboard" && "Dashboard"}
                {selectOption === "live-trades" && "Spot Trading"}
                {selectOption === "candlestick-trades-ohlc" &&
                  "Futures Trading"}
              </h1>

              {/* Content area */}
              <div className="bg-white rounded-lg shadow p-6">
                {selectOption === "dashboard" && (
                  <>
                    <p className="text-gray-600">
                      Welcome to Capitron Dashboard!
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Use the sidebar to navigate between different sections.
                    </p>
                  </>
                )}
                {selectOption === "live-trades" && (
                  <LiveTrades
                    wsConnection={connection}
                    color={{
                      backgroundColor: "#1f2937",
                      lineColor: "#3b82f6",
                      textColor: "#f9fafb",
                      areaTopColor: "#3b82f6",
                      areaBottomColor: "rgba(59, 130, 246, 0.28)",
                    }}
                  />
                )}
                {selectOption === "candlestick-trades-ohlc" && (
                  <>
                    <p className="text-gray-600">Futures Trading Interface</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Advanced futures trading with candlestick charts and OHLC
                      data.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
