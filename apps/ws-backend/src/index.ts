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

type ClientRedisMssgType = {
  conn: WebSocket;
  stream: string[];
};

// connections
let clientWebsocket: ClientRedisMssgType[] = [];

function broadcastMessage(message: string): void {
  // console.log("Stream Name:", streamName);
  const streamName = JSON.parse(message).symbol;
  clientWebsocket = clientWebsocket.filter((client) => {
    if (client.conn.readyState !== WebSocket.OPEN) {
      return false; // drop disconnected clients
    }

    if (
      client.conn.readyState === WebSocket.OPEN &&
      (client.stream.length === 0 || client.stream.includes(streamName)) // if not subscribed to any stream, send all
    ) {
      // send to all the clients who are subscribed to the stream
      // console.log("Client Stream:", message);
      client.conn.send(message);
    }

    return true;
  });
}

const stream: any[] = getStream();

async function handleRedisMessages() {
  try {
    await redisClient.subscribe(stream, (message, channel) => {
      // console.log("Received message from Redis on channel", channel, message);

      const parsedData = JSON.parse(message);

      let date = new Date(parsedData.T);

      // Format the date to YYYY-MM-DD
      let formattedDate =
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0");

      const data = {
        symbol: parsedData.s,
        time: formattedDate,
        value: Number(parsedData.p),
      };

      // console.log("Broadcasting data to clients:", data);

      broadcastMessage(JSON.stringify(data));
    });
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  try {
    await redisClient.connect();
    console.log(getStream());
    await handleRedisMessages();
  } catch (error) {
    console.error(error);
  }
}

app.use(express.json());

app.get("/", (req, res) => {
  console.log("Received request");
  res.send("Hello World");
});

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.on("error", (error) => {
    console.error("Error:", error);
  });

  ws.on("message", (message: Blob | ArrayBuffer | Buffer | ArrayBufferLike) => {
    console.log("Received message from client:", message.toString());

    const messageData = JSON.parse(message.toString());

    if (messageData.type === "join") {
      // clientWebsocket.push(ws);
      clientWebsocket.push({ conn: ws, stream: [] }); // by default subscribe to all streams
      console.log("Client joined the broadcast list");
    } else if (messageData.type === "leave") {
      clientWebsocket = clientWebsocket.filter((client) => client.conn !== ws);
      console.log("Client left the broadcast list");
    } else if (messageData.type === `subscribe`) {
      console.log(`Client subscribed to ${messageData.stream}`);

      // change the stream array
      clientWebsocket.filter((client) => {
        if (
          client.conn === ws && // if present in the array
          client.stream.includes(messageData.stream) === false // avoid duplicates
        ) {
          client.stream.push(messageData.stream);
          console.log("Updated client streams:", client.stream);
          console.log(client.stream);
        }
      });
    } else if (messageData.type === `unsubscribe`) {
      console.log(`Client unsubscribed from ${messageData.stream}`);

      clientWebsocket.filter((client) => {
        if (client.conn === ws) {
          client.stream = client.stream.filter((s) => s !== messageData.stream);
          console.log("Updated client streams:", client.stream);
        }
      });
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

main();
