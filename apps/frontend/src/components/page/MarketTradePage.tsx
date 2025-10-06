"use client";

import React, { useEffect, useRef, useState } from "react";
import OrderBookChart from "../trades-ui/OrderBook";

type MarketTradePageProps = {
  marketId: string;
};

export default function MarketTradePage(props: MarketTradePageProps) {
  const { marketId } = props;
  //   const [data, setData] = useState<Record<string, MarketData>>({});
  const wsConnection = useRef<WebSocket | null>(null);
  const [marketData, setMaretData] = useState<any>({});

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

          console.log(message);

          //   setData((prev) => {
          //     return {
          //       ...prev,
          //       [message.symbol]: {
          //         ...prev[message.symbol],
          //         ...message,
          //       },
          //     };
          //   });
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
    <div className="w-full h-screen bg-white">
      <div className="">
        <OrderBookChart />
      </div>
    </div>
  );
}
