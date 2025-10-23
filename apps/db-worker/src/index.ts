import { getStream } from "@repo/config";
import { createClient } from "redis";
import { getCandles, insertTable, tradeDataType } from "./db/index.js";
import { Queue, RedisOptions, Worker } from "bullmq";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const client = createClient({ url: redisUrl });
const connection: RedisOptions = {
  host: "127.0.0.1",
  port: 6379,
};

const queryQueue = new Queue("query-db", { connection });
const worker = new Worker(
  "query-db",
  async (job) => {
    const { time } = await job.data;
    console.log(`Processing job for ${time} minute candles`);

    const stream: any[] = ["BTCUSDT", "ETHUSDT", "BNBUSDT"]; // getStream();

    for (let symbol of stream) {
      const response = await getCandles(symbol, Number(time));

      // push it to the respective clients
    }
  },
  { connection }
);

(async () => {})();

async function main() {
  try {
    await client.connect();

    handleRedisMessage();

    await queryQueue.add(
      "query-job-1min",
      { time: 1 },
      { repeat: { every: 1 * 60 * 1000 } }
    );

    await queryQueue.add(
      "query-job-2min",
      { time: 2 },
      { repeat: { every: 2 * 60 * 1000 } }
    );

    await queryQueue.add(
      "query-job-5min",
      { time: 5 },
      { repeat: { every: 5 * 60 * 1000 } }
    );
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
}

const stream: any[] = getStream();

async function handleRedisMessage() {
  let batchData: tradeDataType[] = [];

  try {
    console.log("Waiting for messages...");

    await client.subscribe(stream, async (message, channel) => {
      // further operations on the messsage
      // first save
      // second extract on the basis of the time interval
      // saving the record onthe table
      // batch the stream data of 100
      const parsedData = JSON.parse(message);

      if (batchData.length >= 0 && batchData.length < 100) {
        batchData.push(parsedData);
      } else {
        batchData.push(parsedData);
        await insertTable(batchData);
        // console.log("Batch data inserted successfully", batchData.length);
        batchData = []; // clear
      }
    });
  } catch (error) {
    console.error("Error handling Redis message:", error);
  }
}

main().catch((error) => {
  console.error("Error in main execution:", error);
});
