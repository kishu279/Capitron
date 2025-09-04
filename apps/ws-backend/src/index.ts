// STEPS WHAT TO DO
// 1. Create a WebSocket Server
// 2. Handle WebSocket Connections
// 3. BroadCast Message to all connected clients
// create a redis client and fetch from the users
// 4. Fetch by USER :
// 5min, etc, fetch from the database and do operation

import { getStream } from "@repo/config";

import { WebSocketServer } from "ws";
import { createServer } from "http";
import express from "express";
import { createClient } from "redis";

// URL
const redisUrl = "redis://localhost:6379";
const PORT = 8080;

// create a redis client
const redisClient = createClient({ url: redisUrl });

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer }); // create a websocket server

async function main() {
  // create the redis client
  await redisClient.connect();
  console.log("Redis Client connected");

  console.log(getStream());

  await redisClient.subscribe(getStream(), (message, channel) => {
    // console.log(`Received message from Redis on channel ${channel}:`, message);
  });

  // get the subscribed element from the redis
  // the stream
}

app.use(express.json());

app.get("/", (req, res) => {
  console.log("Received request");
  res.send("Hello World");
});

wss.on("connection", (ws) => {
  console.log("New client connected");
  ws.send("Welcome new client!");

  // more event operation
  // ...

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.on("error", (error) => {
    console.error("Error:", error);
  });

  ws.on("message", (message: Blob | ArrayBuffer | Buffer | ArrayBufferLike) => {
    console.log("Received message from client:", message.toString());
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

main();
