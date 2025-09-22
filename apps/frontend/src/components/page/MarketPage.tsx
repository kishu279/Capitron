"use client";

import { getStream } from "@repo/config";
import React from "react";
import MarketTable from "../trades-ui/MarketTable";
import NavBar from "../sections/navbar";

export default function MarketPage() {
  const stream = getStream();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />

      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Market Capital Trades
            </h1>
            <p className="text-lg text-gray-600">
              Real-time market data and trading insights
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <MarketTable stream={stream} />
        </div>
      </main>
    </div>
  );
}
