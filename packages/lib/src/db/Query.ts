import type { BinanceTrade } from "@repo/config";
import pool from "./client.js";

// {
//   "e": "trade",       // Event type
//   "E": 1672515782136, // Event time
//   "s": "BNBBTC",      // Symbol
//   "t": 12345,         // Trade ID
//   "p": "0.001",       // Price
//   "q": "100",         // Quantity
//   "T": 1672515782136, // Trade time
//   "m": true,          // Is the buyer the market maker?
//   "M": true           // Ignore
// }

// create the table
const createTable = async () => {
  // connect the db client
  const poolClient = await pool.connect();
  try {
    // query to create the table
    const query = `
        CREATE TABLE binance_trades (
            event_type VARCHAR(255) NOT NULL,
            event_time TIMESTAMPTZ NOT NULL,
            symbol VARCHAR(50) NOT NULL,
            trade_id BIGINT NOT NULL,
            price DECIMAL(20, 10) NOT NULL,
            quantity DECIMAL(20, 10) NOT NULL,
            trade_time TIMESTAMPTZ NOT NULL,
            is_market_maker BOOLEAN NOT NULL,
            ignore BOOLEAN NOT NULL
        )
        WITH (
            timescaledb.hypertable,
            timescaledb.partition_column='event_time',
            timescaledb.segmentby='symbol'
        );
    `;

    await poolClient.query(query);
    console.log("Table created successfully");
  } catch (error) {
    console.error(error);
  }

  // close the db client
  poolClient.release();
};

// array of the trades for batch processing
async function insertTrade(trade: BinanceTrade[]) {
  const poolClient = await pool.connect();

  try {
    const values: any[] = [];
    const valuesPlaceholders: any[] = [];

    // Loop through trades and build the query parameters
    trade.forEach((t, index) => {
      const offset = index * 9; // Because there are 9 columns in the table

      const eventTimeInSeconds = Math.floor(t.data.E / 1000); // Convert event time to seconds
      const tradeTimeInSeconds = Math.floor(t.data.T / 1000); // Convert trade time to seconds

      console.log(
        "Event Time (Converted):",
        eventTimeInSeconds,
        "Trade Time (Converted):",
        tradeTimeInSeconds
      );

      console.log(
        "Original Event Time (ms):",
        new Date(t.data.E).toUTCString(),
        "Original Trade Time (ms):",
        new Date(t.data.T).toUTCString()
      );

      // Adjusted placeholders for the INSERT query
      valuesPlaceholders.push(
        `($${offset + 1}, to_timestamp($${offset + 2}), $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, to_timestamp($${offset + 7}), $${offset + 8}, $${offset + 9})`
      );

      // Pushing the actual trade data into the values array
      values.push(
        t.data.e, // Event type
        eventTimeInSeconds, // Event time (convert from ms to sec for timestamp)
        t.data.s, // Symbol
        t.data.t, // Trade ID
        t.data.p, // Price
        t.data.q, // Quantity
        tradeTimeInSeconds, // Trade time (convert from ms to sec for timestamp)
        t.data.m, // Is market maker
        t.data.M // Ignore flag
      );
    });

    // Build the query string
    const query = `
      INSERT INTO binance_trades (event_type, event_time, symbol, trade_id, price, quantity, trade_time, is_market_maker, ignore)
      VALUES ${valuesPlaceholders.join(", ")}
    `;

    // Execute the query
    const result = await poolClient.query(query, values);
    console.log("Result: ", result.rowCount);
    console.log("Trade inserted successfully");
  } catch (error) {
    console.error("Error inserting trade: ", error);
  }
  // close the db client
  poolClient.release();
}

// SELECT
//   time_bucket('1 day', time) AS bucket,
//   AVG(temperature) AS avg_temp
// FROM
//   conditions
// GROUP BY
//   bucket
// ORDER BY
//   bucket ASC;

// get the time related trade for the seperate stream
// return the ohlc data for the time period
async function getTrade(time: string) {
  // create the time bucket
  const poolClient = await pool.connect();

  try {
    const query = `
      SELECT time_bucket('5 min', event_time) AS bucket,
      AVG(price) AS avg_price,
      AVG(quantity) AS avg_quantity
      FROM binance_trades
      GROUP BY
      symbol, bucket
      ORDER BY 
      symbol, bucket ASC;
    `;

    const result = await poolClient.query(query);
    console.log("Result: ", result.rows);
  } catch (error) {
    console.error("Error getting trade: ", error);
  }

  // close the db client
  poolClient.release();
}

export { createTable, insertTrade, getTrade };
