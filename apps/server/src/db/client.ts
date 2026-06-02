import { Pool } from "pg";

const connectionString =
  process.env.POSTGRES_URL ?? "postgresql://admin:password@localhost:5440/research";

export const pool = new Pool({
  connectionString,
});

export async function connectPg(): Promise<void> {
  const client = await pool.connect();
  client.release();
}

export async function pingPg(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    return true;
  } catch {
    return false;
  }
}

export async function closePg(): Promise<void> {
  await pool.end();
}
