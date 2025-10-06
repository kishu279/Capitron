"use client";

import React, { useEffect, useRef } from "react";

export interface TradeData {
  symbol: string;
  time: string | number;
  value: number;
  side?: "buy" | "sell" | "up" | "down";
  volume?: number;
}

interface TradesDisplayProps {
  marketData: TradeData[];
  title?: string;
  height?: string;
  width?: string;
  maxItems?: number;
  showVolume?: boolean;
  className?: string;
}

const TradesDisplay: React.FC<TradesDisplayProps> = ({
  marketData,
  title = "Live Trades",
  height = "h-[300px]",
  width = "w-[450px]",
  maxItems = 20,
  showVolume = false,
  className = "",
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to top when new message arrives
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = 0;
    }
  }, [marketData]);

  // Determine trade direction color and icon
  const getTradeStyle = (trade: TradeData, prevTrade?: TradeData) => {
    let direction = trade.side;

    // If no explicit side, determine from price comparison
    if (
      !direction &&
      prevTrade &&
      trade.value !== undefined &&
      prevTrade.value !== undefined
    ) {
      direction = trade.value > prevTrade.value ? "up" : "down";
    }

    switch (direction) {
      case "buy":
      case "up":
        return {
          bgColor: "bg-green-50 hover:bg-green-100",
          borderColor: "border-l-green-500",
          priceColor: "text-green-600",
          icon: "↗",
          iconColor: "text-green-500",
        };
      case "sell":
      case "down":
        return {
          bgColor: "bg-red-50 hover:bg-red-100",
          borderColor: "border-l-red-500",
          priceColor: "text-red-600",
          icon: "↘",
          iconColor: "text-red-500",
        };
      default:
        return {
          bgColor: "bg-gray-50 hover:bg-gray-100",
          borderColor: "border-l-gray-400",
          priceColor: "text-gray-700",
          icon: "→",
          iconColor: "text-gray-500",
        };
    }
  };

  const formatTime = (time: string | number) => {
    const date = new Date(time);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className={`${width} ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-3 rounded-t-lg">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          {title}
        </h3>
      </div>

      {/* Trades Container */}
      <div
        ref={messagesEndRef}
        className={`${height} border-2 border-t-0 border-gray-200 overflow-auto bg-white rounded-b-lg shadow-lg`}
      >
        <div className="flex flex-col-reverse">
          {marketData.slice(0, maxItems).map((trade, index) => {
            const prevTrade =
              index < marketData.length - 1 ? marketData[index + 1] : undefined;
            const style = getTradeStyle(trade, prevTrade);

            return (
              <div
                key={`${trade.symbol}-${trade.time}-${index}`}
                className={`
                  px-4 py-3 border-b border-gray-100 border-l-4 
                  ${style.bgColor} ${style.borderColor}
                  transform transition-all duration-300 ease-in-out
                  hover:scale-[1.02] hover:shadow-md
                  animate-in slide-in-from-top
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  {/* Left side - Symbol and Icon */}
                  <div className="flex items-center gap-3">
                    <span className={`text-xl font-bold ${style.iconColor}`}>
                      {style.icon}
                    </span>
                    <div>
                      <span className="font-bold text-gray-800 text-lg">
                        {trade.symbol}
                      </span>
                      <div className="text-xs text-gray-500">
                        {formatTime(trade.time)}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Price and Volume */}
                  <div className="text-right">
                    <div className={`text-xl font-bold ${style.priceColor}`}>
                      ${formatNumber(trade.value)}
                    </div>

                    {/* Volume Info */}
                    {showVolume && trade.volume && (
                      <div className="text-sm mt-1">
                        <span className="text-gray-600">
                          Vol: {formatNumber(trade.volume, 0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {marketData.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p>No trades available</p>
              <p className="text-sm">Waiting for market data...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradesDisplay;
