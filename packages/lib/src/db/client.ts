import client from "pg";

const dbClient = new client.Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "sourav",
  database: "postgres",
});

export default dbClient;
