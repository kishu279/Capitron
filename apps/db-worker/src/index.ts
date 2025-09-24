import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const client = createClient({ url: redisUrl });

async function main() {
  try {
    await client.connect();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
}

async function handleRedisMessage() {
  try {
    const messages = await client.xRead(
      { id: "$", key: "trades" },
      { BLOCK: 0 }
    );

    for (let message_data of messages) {
    }
  } catch (error) {
    console.error("Error handling Redis message:", error);
  }
}

await main();
