// app/db/schema.ts
import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const summaries = pgTable('summaries', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  transcript: text('transcript').notNull(),
  prompt: text('prompt').notNull(),
  summary: text('summary').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
