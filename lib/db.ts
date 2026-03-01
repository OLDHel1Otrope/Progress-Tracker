import { Pool, types } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

types.setTypeParser(1082, (val) => val);

declare global {
  var pgPool: Pool | undefined;
}

const isProduction = process.env.NODE_ENV === "production";

export const db =
  global.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction
      ? { rejectUnauthorized: false }
      : false,
  });

if (!isProduction) {
  global.pgPool = db;
}