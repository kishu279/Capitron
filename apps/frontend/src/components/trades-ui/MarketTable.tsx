import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

type MarketData = {
  symbol: string;
  time: string;
  value: number;
};

type MarketTableProps = {
  stream: string[];
};

export default function MarketTable(props: MarketTableProps) {
  const [data, setData] = useState<Record<string, MarketData>>({});
  const wsConnection = useRef<WebSocket | null>(null);

  // const stream =
  useEffect(() => {
    try {
      wsConnection.current = new WebSocket("ws://localhost:8080");

      if (
        wsConnection.current &&
        wsConnection.current.readyState === WebSocket.CONNECTING
      ) {
        wsConnection.current.onopen = () => {
          console.log("WebSocket is connected");
          wsConnection.current!.send(JSON.stringify({ type: "join" }));
        };

        wsConnection.current.onmessage = (event) => {
          const message = JSON.parse(event.data);

          // console.log(message);

          setData((prev) => {
            return {
              ...prev,
              [message.symbol]: {
                ...prev[message.symbol],
                ...message,
              },
            };
          });
        };

        wsConnection.current.onclose = () => {
          console.log("WebSocket is closed");
        };

        wsConnection.current.onerror = (error) => {
          console.log("WebSocket error:", error);
        };
      }
    } catch (error) {
      console.error("Web");
    }

    return () => {
      if (
        wsConnection.current &&
        wsConnection.current.readyState === WebSocket.OPEN
      ) {
        wsConnection.current.close();
      }
    };
  }, []);

  return (
    <section className="w-full">
      {/* Connection Status */}
      <div className="mb-6 flex items-center justify-between bg-gray-50 rounded-lg p-4 border">
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full ${wsConnection.current?.readyState === WebSocket.OPEN ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
          ></div>
          <span className="text-sm font-medium text-gray-700">
            {wsConnection.current?.readyState === WebSocket.OPEN
              ? "Live Market Data"
              : "Disconnected"}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {Object.keys(data).length} symbols tracking
        </div>
      </div>

      {/* Market Data Grid */}
      <div className="space-y-3">
        {Object.values(data).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
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
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Market Data
              </h3>
              <p className="text-gray-500">
                {wsConnection.current?.readyState === WebSocket.OPEN
                  ? "Waiting for live market data..."
                  : "Please check your connection and try again."}
              </p>
            </div>
          </div>
        ) : (
          Object.values(data).map((item, idx) => (
            <MarketRow {...item} key={item.symbol || idx} />
          ))
        )}
      </div>
    </section>
  );
}

function MarketRow(data: MarketData) {
  const router = useRouter();
  // Helper functions for better formatting
  const formatValue = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(value);
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    return {
      time: date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  };

  const getSymbolIcon = (symbol: string) => {
    if (symbol.includes("BTC")) return "₿";
    if (symbol.includes("ETH")) return "Ξ";
    if (symbol.includes("USD")) return "$";
    return "📈";
  };

  const getChangeIndicator = () => {
    // You can implement price change logic here
    const isPositive = Math.random() > 0.5; // Random for demo
    return isPositive ? "text-green-600" : "text-red-600";
  };

  const formattedTime = formatTime(data.time);

  return (
    <div className="group hover:shadow-lg transition-all duration-300 ease-in-out">
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Symbol Section */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {getSymbolIcon(data.symbol)}
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {data.symbol}
              </div>
              <div className="text-sm text-gray-500">Live Trading</div>
            </div>
          </div>

          {/* Value Section */}
          <div className="text-center md:text-left">
            <div className={`text-2xl font-bold ${getChangeIndicator()}`}>
              {formatValue(data.value)}
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-1 mt-1">
              <svg
                className={`w-4 h-4 ${Math.random() > 0.5 ? "text-green-500 rotate-0" : "text-red-500 rotate-180"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-600">
                {(Math.random() * 5).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Time Section */}
          <div className="text-center md:text-left">
            <div className="text-lg font-semibold text-gray-900">
              {formattedTime.time}
            </div>
            <div className="text-sm text-gray-500">{formattedTime.date}</div>
          </div>

          {/* Action Section */}
          <div className="flex justify-center md:justify-end space-x-2">
            <button
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              onClick={() => {
                router.push(`/market/${data.symbol}`);
              }}
            >
              Track
            </button>
            <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
              Details
            </button>
          </div>
        </div>

        {/* Additional Info Bar */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Real-time data</span>
          </span>
          <span>Last updated: {formattedTime.time}</span>
        </div>
      </div>
    </div>
  );
}
