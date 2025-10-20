"use client";

import React, { useEffect, useRef, useState } from "react";
import OrderBookChart from "../trades-ui/OrderBook";
import TradesDisplay, { TradeData } from "../trades-ui/TradesDisplay";

type MarketTradePageProps = {
  marketId: string;
};

export default function MarketTradePage(props: MarketTradePageProps) {
  const { marketId } = props;
  const wsConnection = useRef<WebSocket | null>(null);
  const [marketData, setMaretData] = useState<TradeData[]>([]);

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
          wsConnection.current!.send(
            JSON.stringify({ type: "subscribe", stream: marketId })
          );
        };

        wsConnection.current.onmessage = (event) => {
          const message = JSON.parse(event.data);

          setMaretData((prev) => {
            // Transform the message to match TradeData interface
            const tradeData: TradeData = {
              symbol: message.symbol || marketId,
              time: message.time || new Date().toISOString(),
              value: parseFloat(message.value) || 0,
              side: message.side || (Math.random() > 0.5 ? "buy" : "sell"),
              volume: message.volume
                ? parseFloat(message.volume)
                : Math.floor(Math.random() * 1000),
            };

            const newTrades = [tradeData, ...prev];

            // Keep only the latest 15 trades
            if (newTrades.length > 15) {
              newTrades.pop();
            }

            return newTrades;
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
    <div className="w-full h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex flex-col items-center justify-center h-full p-8">
        {/* Single Live Trades Display */}
        {/* <TradesDisplay
          marketData={marketData}
          title={`${marketId} Live Trades`}
          height="h-[500px]"
          width="w-[600px]"
          maxItems={15}
          showVolume={true}
          className="shadow-2xl"
        /> */}
      </div>
    </div>
  );
}
