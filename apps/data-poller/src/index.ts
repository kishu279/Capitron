// STEPS TO POOL THE PRIZE AND THEN PUSH TO PUB SUB
// 1. creat the client
// 2. get the link
// 3. get the data using the link
// 4. push the data to redis pub sub
// ...

import { createClient } from "redis";
import WebSocket from "ws";

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

// BINANCE -> api
const binanceBaseUrl = "wss://stream.binance.com:443/stream?streams="; // WEBSOCKET base url
const service = ["btcusdt", "ethusdt", "bnbusdt"]; // service

async function main() {
  try {
    // connect to the redis client
    await redisClient.connect();
    console.log("Redis Client connected");

    // link
    const paramsLink = service
      .map((service) => `${service}@bookTicker`)
      .join("/");
    const fullLink = `${binanceBaseUrl}${paramsLink}`;

    // polling the data from the web socket server
    const websocketClient = new WebSocket(fullLink);
    websocketClient.onopen = () => {
      console.log("Websocket Client connected");
    };

    websocketClient.onmessage = async (message) => {
      // handle incoming messages
      const data = JSON.parse(message.data);
      const { stream, data: ticker }: BinanceBookTicker = data;

      console.log("Received message: ", data);

      // push the data to redis pub sub
      await redisClient.publish(stream, JSON.stringify(ticker));
    };

    websocketClient.onclose = () => {
      console.log("Websocket Client disconnected");
    };

    websocketClient.onerror = (error) => {
      console.error("Websocket error:", error);
    };

    // push the data ro redis pub sub
    //
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
