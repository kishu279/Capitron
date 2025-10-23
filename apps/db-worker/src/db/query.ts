import { client } from "./client.js";

export type tradeDataType = {
  e: string;
  E: BigInt;
  s: string;
  t: string;
  p: string;
  q: string;
  T: BigInt;
  m: boolean;
  M: boolean;
};

const createTable = `
    CREATE TABLE IF NOT EXISTS capitron_data (
      event_type VARCHAR(255) NOT NULL,
      event_time TIMESTAMP NOT NULL,
      symbol VARCHAR(255) NOT NULL,
      trade_id VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      quantity VARCHAR(255) NOT NULL,
      trade_time TIMESTAMP NOT NULL,
      is_market_maker BOOLEAN NOT NULL,
      ignore BOOLEAN NOT NULL
    )
    WITH (
      timescaledb.hypertable,
      timescaledb.partition_column='event_time',
      timescaledb.segmentby='symbol'
    );    
`;

const createMaterializedView = `
  CREATE MATERIALIZED VIEW candles_2m 
  WITH (timescaledb.continuous) AS
  SELECT 
  symbol,
  time_bucket('2 minute', event_time) AS bucket,
  first(price, event_time) AS open,
  max(price) AS high,
  min(price) AS low,
  last(price, event_time) AS close,
  sum(quantity::FLOAT) AS volume
  FROM capitron_data
  GROUP BY symbol,
  bucket;
`;

const createPolicy = `
  SELECT add_continuous_aggregate_policy('candles_2m', 
    start_offset => INTERVAL '1 hour',
    end_offset => INTERVAL '2 minute',
    schedule_interval => INTERVAL '2 minute'
  );  
  // for 1m 2m 5m done
`;

// const queryCandles = `
//   SELECT * FROM candles_1m
//   WHERE symbol = $1 AND bucket >= now() - INTERVAL '1 hour'
//   ORDER BY bucket DESC
//   LIMIT 1;
// `;

export async function getCandles(symbol: string, time: number) {
  const pgClient = await client.connect();

  if (!time) return;

  // Use template string for table name safely (validate input!)
  const tableName = `candles_${time}m`;

  // console.log("Querying table:", tableName);

  const queryCandles = `
    SELECT * FROM ${tableName}
    WHERE symbol = $1 AND bucket >= now() - INTERVAL '1 hour'
    ORDER BY bucket DESC
    LIMIT 1;
  `;

  try {
    const result = await pgClient.query(queryCandles, [symbol]);
    // console.log(`Result from ${tableName}:`, result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error(`Error querying ${tableName}:`, error);
  } finally {
    pgClient.release(); // ✅ don't forget this
  }
}

export async function insertTable(tradeData: tradeDataType[]) {
  const pgClient = await client.connect();
  try {
    // create the table if it doesn't exist
    await pgClient.query(createTable);

    // insert the into the table
    const values: any[] = [];
    const valuesPlaceholders: any[] = [];

    tradeData.forEach((trade, index) => {
      const offset = index * 9; // Because there are 9 columns in the table

      const eventTimeInSeconds = Math.floor(Number(trade.E) / 1000);
      const tradeTimeInSeconds = Math.floor(Number(trade.T) / 1000);

      valuesPlaceholders.push(
        `($${offset + 1}, to_timestamp($${offset + 2}), $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, to_timestamp($${offset + 7}), $${offset + 8}, $${offset + 9})`
      );

      values.push(
        trade.e, // Event type
        eventTimeInSeconds, // Event time (convert from ms to sec for timestamp)
        trade.s, // Symbol
        trade.t, // Trade ID
        trade.p, // Price
        trade.q, // Quantity
        tradeTimeInSeconds, // Trade time (convert from ms to sec for timestamp)
        trade.m, // Is market maker
        trade.M // Ignore flag
      );
    });

    const query = `
      INSERT INTO capitron_data (event_type, event_time, symbol, trade_id, price, quantity, trade_time, is_market_maker, ignore)
      VALUES ${valuesPlaceholders.join(", ")}
    `;

    const result = await pgClient.query(query, values);
    // console.log("Result: ", result.rowCount);
    // console.log("Trade inserted successfully");

    pgClient.release();
  } catch (error) {
    console.log(error);
    pgClient.release();
    throw error;
  }
}
