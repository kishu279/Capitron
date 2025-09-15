// WRITE ALL THE QUERY RELATED
// create the table
// insert into the table
// select from the table

import dbClient from "./client.js";

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
  await dbClient.connect();
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

    await dbClient.query(query);
    console.log("Table created successfully");
  } catch (error) {
    console.error(error);
  }

  // close the db client
  await dbClient.end();
};

async function insertTrade() {}

export { createTable };
