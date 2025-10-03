import { createClient } from "redis";

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

async function handleRedisMessage() {
  try {
    console.log("Waiting for messages...");

    let lastId: string = "$";

    const messages = await client.xRead(
      { id: lastId, key: "trades:binance" },
      { BLOCK: 0 }
    );

    console.log("Message received:", messages);

    // const response = await client.xGroupCreate(
    //   "trades:binance",
    //   "binance-group",
    //   "$"
    // );
    // console.log(response); // >>> OK

    // const messages = await client.xReadGroup(
    //   "binance-group",
    //   "sourave",
    //   {
    //     key: "trades:binance",
    //     id: ">",
    //   },
    //   {
    //     COUNT: 1,
    //   }
    // );

    // console.log("Message received:", messages);

    // console.log("Received messages:", messages);
  } catch (error) {
    console.error("Error handling Redis message:", error);
  }
}

main().catch((error) => {
  console.error("Error in main execution:", error);
});
