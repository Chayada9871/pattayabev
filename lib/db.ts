import { Pool } from "pg";

declare global {
  // Reuse the same pool across hot reloads in development.
  var __pattayabevPool: Pool | undefined;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const db =
  global.__pattayabevPool ??
  new Pool({
    connectionString: getRequiredEnv("DATABASE_URL"),
    ssl: {
      rejectUnauthorized: false
    }
  });

if (process.env.NODE_ENV !== "production") {
  global.__pattayabevPool = db;
}
