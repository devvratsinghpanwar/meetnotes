// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Explicitly load variables from .env.local
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in your .env.local file');
}

export default defineConfig({
  schema: './app/db/schema.ts',
  out: './migration',
  dialect: 'postgresql', // Specify the database dialect
  dbCredentials: {
    // Pass the connection string to the migration tool
    url: process.env.DATABASE_URL,
  },
});