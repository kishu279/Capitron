import client from "pg";

const dbClient = new client.Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "password",
  database: "postgres",
});

export default dbClient;
