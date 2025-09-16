import type { BinanceTrade } from "@repo/config";
// WRITE ALL THE QUERY RELATED
// create the table
// insert into the table
// select from the table

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
            event_time BIGINT NOT NULL,
            symbol VARCHAR(50) NOT NULL,
            trade_id BIGINT NOT NULL,
            price DECIMAL(20, 10) NOT NULL,
            quantity DECIMAL(20, 10) NOT NULL,
            trade_time BIGINT NOT NULL,
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
    // const query = `
    //   INSERT INTO binance_trades (event_type, event_time, symbol, trade_id, price, quantity, trade_time, is_market_maker, ignore)

    //   VALUES (
    //     ${trade.map((t) => `${t.data.e}, ${t.data.E}, ${t.data.s}, ${t.data.t}, ${t.data.p}, ${t.data.q}, ${t.data.T}, ${t.data.m}, ${t.data.M}`)}
    //   )
    // `;

    const values: any[] = [];
    const valuesPlaceholders: any[] = [];

    trade.map((t, index) => {
      const offset = index * 9;

      valuesPlaceholders.push(
        `(${offset + 0}, ${offset + 1}, ${offset + 2}, ${offset + 3}, ${offset + 4}, ${offset + 5}, ${offset + 6}, ${offset + 7}, ${offset + 8})`
      );

      values.push(
        t.data.e,
        t.data.E,
        t.data.s,
        t.data.t,
        t.data.p,
        t.data.q,
        t.data.T,
        t.data.m,
        t.data.M
      );
    });

    const query = `
      INSERT INTO binance_trades (event_type, event_time, symbol, trade_id, price, quantity, trade_time, is_market_maker, ignore)

      VALUES ${valuesPlaceholders.join(", ")}
    `;

    await poolClient.query(query, values);
    console.log("Trade inserted successfully");
  } catch (error) {
    console.error("Error inserting trade: ", error);
  }

  // close the db client
  poolClient.release();
}

export { createTable, insertTrade };
