"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AreaSeries,
  createChart,
  ColorType,
  IChartApi,
} from "lightweight-charts";

enum ChartTypes {
  Trade = "trade",
  OrderBook = "orderBook",
}

enum TradesService {
  BTCUSDT = "btcusdt",
  ETHUSDT = "ethusdt",
  BNBUSDT = "bnbusdt",
}

interface TradingProps {
  wsConnection: WebSocket | null;
  chartType?: ChartTypes;
  trades?: TradesService[];
  color?: {
    backgroundColor: string;
    lineColor: string;
    textColor: string;
    areaTopColor: string;
    areaBottomColor: string;
  };
}

const trade_data = [
  { time: "2019-04-11", value: 80.01 },
  { time: "2019-04-12", value: 96.63 },
  { time: "2019-04-13", value: 76.64 },
  { time: "2019-04-14", value: 81.89 },
  { time: "2019-04-15", value: 74.43 },
  { time: "2019-04-16", value: 80.01 },
  { time: "2019-04-17", value: 96.63 },
  { time: "2019-04-18", value: 76.64 },
  { time: "2019-04-19", value: 81.89 },
  { time: "2019-04-20", value: 74.43 },
];

export default function LiveTrades(props: TradingProps) {
  // State for user selections - only trade service since chart type is fixed to Trade
  const [selectedTradeService, setSelectedTradeService] =
    useState<TradesService>(TradesService.BTCUSDT);

  // chart reference
  const [chartSeries, setChartSeries] = useState<IChartApi | null>(null);
  // Chart type is fixed to Trade only
  const selectedChartType = ChartTypes.Trade;

  // Default color configuration if none provided
  const {
    wsConnection,
    chartType = ChartTypes.Trade,
    trades = TradesService.BTCUSDT,
    color: {
      backgroundColor = "white",
      lineColor = "#2962FF",
      textColor = "black",
      areaTopColor = "#2962FF",
      areaBottomColor = "rgba(41, 98, 255, 0.28)",
    } = {},
  } = props;

  // subscribe to the trade data then pass the data to the chart
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  async function updateTradeData() {
    console.log(
      `Updating trade data for ${selectedTradeService} with chart type ${selectedChartType}`
    );
    // Here you would typically fetch data based on selectedTradeService and selectedChartType
    // For now, we'll just log the selection
  }

  // Handle trade data updates when selections change
  useEffect(() => {
    updateTradeData();
  }, [selectedTradeService]); // Only selectedTradeService since chartType is fixed

  useEffect(() => {
    console.log("WebSocket connection in LiveTrades:", wsConnection);
    console.log("WebSocket readyState:", wsConnection?.readyState);

    if (!wsConnection) {
      console.log("WebSocket connection not found");
      return;
    }

    if (wsConnection.readyState !== WebSocket.OPEN) {
      console.log(
        "WebSocket connection not open yet, readyState:",
        wsConnection.readyState
      );
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Trade message received:", message);
        console.log(`Current trade service: ${selectedTradeService}`);

        // Here you can filter messages based on selectedTradeService
        // Example: if (message.symbol === selectedTradeService.toUpperCase()) { ... }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    wsConnection.addEventListener("message", handleMessage);

    return () => {
      wsConnection.removeEventListener("message", handleMessage);
    };
  }, [wsConnection, selectedTradeService]);

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const chart = createChart(chartContainerRef.current!, {
      layout: { background: { type: ColorType.Solid, color: backgroundColor } },
      width: chartContainerRef.current?.clientWidth,
    });

    chart.timeScale().fitContent();

    const series = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    });

    // to use on the chart
    setChartSeries(chart);

    // initial data store
    series.setData(trade_data);

    // series.update();
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.onmessage = (event) => {
        console.log("WebSocket message received");
        const message = JSON.parse(event.data);

        // console.log((message.time));
        series.update(message);
      };
    }

    // if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    //   // connection oriented
    //   // series.update()
    // }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      chart.remove();
    };
  }, [
    backgroundColor,
    lineColor,
    textColor,
    areaTopColor,
    areaBottomColor,
    selectedTradeService, // Only selectedTradeService since chartType is fixed
  ]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-gray-600 text-lg font-semibold">Live Trades</p>
        <p className="text-sm text-gray-500 mt-2">
          Real-time live trades functionality will be implemented here.
        </p>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Trade Service Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-900">
            Trade Pair:
          </label>
          <select
            value={selectedTradeService}
            onChange={(e) =>
              setSelectedTradeService(e.target.value as TradesService)
            }
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value={TradesService.BTCUSDT}>BTC/USDT</option>
            <option value={TradesService.ETHUSDT}>ETH/USDT</option>
            <option value={TradesService.BNBUSDT}>BNB/USDT</option>
          </select>
        </div>

        {/* Chart Type Buttons (Read-only) */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-900">
            Chart Type:
          </label>
          <div className="flex gap-2">
            <button
              disabled
              className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white cursor-not-allowed"
            >
              Trade
            </button>
            <button
              disabled
              className="px-4 py-2 rounded-md text-sm font-medium bg-gray-300 text-gray-600 cursor-not-allowed"
            >
              Order Book
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-900">Status:</label>
          <div className="flex items-center gap-2 px-3 py-2">
            <div
              className={`w-3 h-3 rounded-full transition-colors ${wsConnection ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            <span className="text-sm text-gray-900 font-medium">
              {wsConnection ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div>
        <div className="w-full h-full">
          <div
            ref={chartContainerRef}
            style={{ backgroundColor }}
            className="w-full min-h-[400px] rounded-lg border border-gray-200"
          ></div>
        </div>
      </div>
    </div>
  );
}
