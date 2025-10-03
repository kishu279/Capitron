"use client";

import { getStream } from "@repo/config";
import React, { useState } from "react";
import MarketTable from "../trades-ui/MarketTable";
import NavBar from "../sections/navbar";

// Sidebar component for market page
function MarketSidebar() {
  const [activeSection, setActiveSection] = useState("trades");

  const sidebarSections = [
    {
      id: "trades",
      title: "Trades",
      icon: "📈",
      items: ["Active Trades", "Trade History", "Portfolio", "Watchlist"],
    },
    {
      id: "account",
      title: "Account Settings",
      icon: "⚙️",
      items: ["Profile", "Security", "Notifications", "Billing", "API Keys"],
    },
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-100 h-screen fixed left-0 top-0 z-10 shadow-lg">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-blue-600">💼</span>
          Dashboard
        </h2>
      </div>

      <div className="p-6 space-y-4 overflow-y-auto h-full pb-20">
        {sidebarSections.map((section) => (
          <div key={section.id} className="bg-gray-50 rounded-lg p-4">
            <button
              className="w-full flex items-center justify-between text-left group"
              onClick={() =>
                setActiveSection(activeSection === section.id ? "" : section.id)
              }
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{section.icon}</span>
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {section.title}
                </h3>
              </div>
              <span
                className={`text-gray-400 transition-transform ${activeSection === section.id ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>

            {activeSection === section.id && (
              <div className="mt-4 space-y-1">
                {section.items.map((item, index) => (
                  <button
                    key={index}
                    className="w-full text-left text-sm text-gray-600 hover:text-blue-600 hover:bg-white px-3 py-2 rounded-md transition-all duration-200 hover:shadow-sm"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

export default function MarketPage() {
  const stream = getStream();

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketSidebar />

      {/* Main content area with left margin to account for fixed sidebar */}
      <div className="ml-72">
        <NavBar />

        {/* Clean header section */}
        <header className="bg-white border-b border-gray-100">
          <div className="px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Market Capital Trades
              </h1>
              <p className="text-gray-600">
                Real-time market data and trading insights
              </p>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <MarketTable stream={stream} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
