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

// types
type ClientEventsType = {
  stream: string[];
  candle: "1-min" | "2-min" | "5-min" | "";
};

// global variables to handle connections and streams
const clientWebsocket = new Map<WebSocket, ClientEventsType>();
const clientStream = new Map<string, WebSocket[]>();
const clientCandles = new Map<string, WebSocket[]>();

// type ClientRedisMssgType = {
//   conn: WebSocket;
//   stream: string[];
//   candle: "1-min" | "2-min" | "5-min" | "";
// };

// // connections
// let clientWebsocket: ClientRedisMssgType[] = [];
// let clientCandles: Record<string, WebSocket[]> = {};

// async function handleCandlesData(message: string): Promise<void> {
//   const stream: any[] = getStream();

//   try {
//     const candle = JSON.parse(message).candle;

//     clientWebsocket = clientWebsocket.filter((client) => {
//       if (client.conn.readyState !== WebSocket.OPEN) {
//         return false;
//       }

//       if () {}
//     });
//   } catch (error) {
//     console.error(error);
//   }
// }

async function broadCastCandles() {
  // get the candles streams subscribed by clients
}

async function broadcastMessage(message: string): Promise<void> {
  // console.log("Stream Name:", streamName);
  const streamName = JSON.parse(message).symbol;

  // console.log("Broadcasting message to stream:", streamName);

  // get the stream clients
  let streamClients = clientStream.get(streamName);
  if (streamClients && streamClients?.length > 0) {
    streamClients = streamClients.filter((client) => {
      if (client.readyState !== WebSocket.OPEN) {
        // drop disconnected clients
        clientWebsocket.delete(client);
        return false;
      }

      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

async function handleRedisMessages() {
  const stream: any[] = getStream();
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
    console.log("Connected to Redis");

    // periodically broad cast the candles
    
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

  //   on message from client
  ws.on("message", (message: Blob | ArrayBuffer | Buffer | ArrayBufferLike) => {
    // convert message to string
    const messageData = JSON.parse(message.toString());

    // check the message that it containes type, stream and candle
    if (messageData.type === "join") {
      // push the client
      clientWebsocket.set(ws, { stream: [], candle: "" });
      console.log("user joined");
    } else if (messageData.type === "leave") {
      // remove the client
      clientWebsocket.delete(ws);
      console.log("user left");
    } else if (messageData.type === "subscribe") {
      // update the stream and candle
      let clientCandleToSubscribe = messageData.candle;
      let clientStreamToSubscribe = messageData.stream; // all the streams

      //   get the client
      let client = clientWebsocket.get(ws);
      if (client) {
        // present then update the stream and candle

        client.candle = clientCandleToSubscribe; // candle updated

        if (!client?.stream.includes(clientStreamToSubscribe))
          client?.stream.push(clientStreamToSubscribe); // stream updated

        // update the candle map
        if (!clientCandles.has(clientCandleToSubscribe))
          clientCandles.set(clientCandleToSubscribe, []);
        const candleClients = clientCandles.get(clientCandleToSubscribe)!;
        if (!candleClients.includes(ws)) candleClients.push(ws);

        // update the stream map
        if (!clientStream.has(clientStreamToSubscribe))
          clientStream.set(clientStreamToSubscribe, []);
        const streamClients = clientStream.get(clientStreamToSubscribe)!;
        if (!streamClients.includes(ws)) streamClients.push(ws);
      }
      console.log("Subscribed to stream:", clientStreamToSubscribe);
      console.log("Subscribed to candle:", clientCandleToSubscribe);
    } else if (messageData.type === "unsubscribe") {
      // update the stream and candle
      let clientCandleToUnsubscribe = messageData.candle;
      let clientStreamToUnsubscribe = messageData.stream;

      //   get the client
      let client = clientWebsocket.get(ws);
      if (client) {
        // present then update the stream and candle
        client.candle = clientCandleToUnsubscribe; // candle updated
        if (client?.stream.includes(clientStreamToUnsubscribe))
          client?.stream.splice(
            client?.stream.indexOf(clientStreamToUnsubscribe),
            1
          ); // stream updated

        // update the candle map
        if (clientCandles.has(clientCandleToUnsubscribe)) {
          const candleClients = clientCandles.get(clientCandleToUnsubscribe)!;
          if (candleClients.includes(ws))
            candleClients.splice(candleClients.indexOf(ws), 1);
        }

        // update the stream map
        if (clientStream.has(clientStreamToUnsubscribe)) {
          const streamClients = clientStream.get(clientStreamToUnsubscribe)!;
          if (streamClients.includes(ws))
            streamClients.splice(streamClients.indexOf(ws), 1);
        }
      }

      console.log("Unsubscribed from stream:", clientStreamToUnsubscribe);
      console.log("Unsubscribed from candle:", clientCandleToUnsubscribe);
    }
  });

  //   ws.on("message", (message: Blob | ArrayBuffer | Buffer | ArrayBufferLike) => {
  //     console.log("Received message from client:", message.toString());

  //     const messageData = JSON.parse(message.toString());

  //     if (messageData.type === "join") {
  //       // clientWebsocket.push(ws);
  //       clientWebsocket.push({ conn: ws, stream: [], candle: "1-min" }); // by default subscribe to all streams
  //       console.log("Client joined the broadcast list");
  //     } else if (messageData.type === "leave") {
  //       clientWebsocket = clientWebsocket.filter((client) => client.conn !== ws);
  //       console.log("Client left the broadcast list");
  //     } else if (messageData.type === `subscribe`) {
  //       console.log(`Client subscribed to ${messageData.stream}`);

  //       // change the stream array
  //       clientWebsocket.filter((client) => {
  //         if (
  //           client.conn === ws && // if present in the array
  //           client.stream.includes(messageData.stream) === false // avoid duplicates
  //         ) {
  //           client.stream.push(messageData.stream);
  //           console.log("Updated client streams:", client.stream);
  //           console.log(client.stream);
  //         }
  //       });
  //     } else if (messageData.type === `unsubscribe`) {
  //       console.log(`Client unsubscribed from ${messageData.stream}`);

  //       clientWebsocket.filter((client) => {
  //         if (client.conn === ws) {
  //           client.stream = client.stream.filter((s) => s !== messageData.stream);
  //           console.log("Updated client streams:", client.stream);
  //         }
  //       });
  //     }
  //   });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

main();
