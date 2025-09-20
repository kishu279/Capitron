import { getStream } from "@repo/config";
import WebSocket, { WebSocketServer } from "ws";
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

// connections
let clientWebsocket: WebSocket[] = [];

function broadcastMessage(message: string): void {
  clientWebsocket.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

async function handleRedisMessages() {
  try {
    const stream = getStream();

    await redisClient.subscribe(stream, (message, channel) => {
      console.log("Received message from Redis on channel", channel, message);

      broadcastMessage(message);
    });
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  try {
    await redisClient.connect();

    handleRedisMessages();
  } catch (error) {
    console.error(error);
  }
}

// async function main() {
//   // create the redis client
//   await redisClient.connect();
//   console.log("Redis Client connected");

//   console.log(getStream());

//   await redisClient.subscribe(getStream(), (message, channel) => {
//     // console.log(`Received message from Redis on channel ${channel}:`, message);
//   });

//   // get the subscribed element from the redis
//   // the stream
// }

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
