import { getStream } from "@repo/config";
import { createClient } from "redis";
import { insertTable, tradeDataType } from "./db/index.js";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const client = createClient({ url: redisUrl });

async function main() {
  try {
    await client.connect();

    handleRedisMessage();
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
        console.log("Batch data inserted successfully", batchData.length);
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
