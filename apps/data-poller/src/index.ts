// STEPS TO POOL THE PRIZE AND THEN PUSH TO PUB SUB
// 1. creat the client
// 2. get the link
// 3. get the data using the link
// 4. push the data to redis pub sub
// ...

import { createClient } from "redis";
import WebSocket from "ws";
import { binanceService, getBinanceLink } from "@repo/config";

// REDIS -> PUB SUB
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisClient = createClient({ url: redisUrl });

interface BinanceBookTicker {
  stream: String;
  data: {
    e: "bookTicker"; // Event type
    u: number; // Order book updateId
    s: string; // Symbol
    b: string; // Best bid price
    B: string; // Best bid qty
    a: string; // Best ask price
    A: string; // Best ask qty
  };
}

interface BinanceTrade {
  stream: string;
  data: {
    e: "trade";
    E: number;
    s: "string";
    t: number;
    p: string;
    q: string;
    T: number;
    m: boolean;
    M: boolean;
  };
}

// BINANCE -> api
const binanceBaseUrl = "wss://stream.binance.com:443/stream?streams="; // WEBSOCKET base url
// const service = ["btcusdt", "ethusdt", "bnbusdt"]; // service

async function main() {
  try {
    // connect to the redis client
    await redisClient.connect();
    console.log("Redis Client connected");

    // link
    const paramsLink = getBinanceLink();
    const fullLink = `${binanceBaseUrl}${paramsLink}`;

    // polling the data from the web socket server
    const websocketClient = new WebSocket(fullLink);
    websocketClient.onopen = () => {
      console.log("Websocket Client connected");
    };

    websocketClient.onmessage = async (message) => {
      // handle incoming messages
      const data = JSON.parse(message.data.toString());
      const { stream, data: trade }: BinanceTrade = data;

      console.log("Received message: ", data);

      // push the data to redis pub sub
      await redisClient.publish(stream.toString(), JSON.stringify(trade));
    };

    websocketClient.onclose = () => {
      console.log("Websocket Client disconnected");
    };

    websocketClient.onerror = (error) => {
      console.error("Websocket error:", error);
    };
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    const timer = setTimeout(() => {
      main();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }
}

main();
