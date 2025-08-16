// app/db/index.ts
import { neon } from '@neondatabase/serverless';  // Neon's serverless HTTP client [[1]] [[2]] [[5]]
import { drizzle } from 'drizzle-orm/neon-http';  // Drizzle's HTTP driver for Neon [[1]] [[3]] [[10]]
import * as schema from './schema';  // Import your schema definitions
import { config } from "dotenv";
config({ path: ".env" });
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');  // Safety check [[5]] [[10]]
}

const sql = neon(process.env.DATABASE_URL);  // Create HTTP connection [[1]] [[2]] [[5]] [[8]]
export const db = drizzle(sql, { schema });  // Drizzle instance with schema [[1]] [[3]] [[10]]
