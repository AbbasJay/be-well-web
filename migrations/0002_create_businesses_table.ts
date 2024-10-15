import { sql } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export async function up(db: PostgresJsDatabase) {
  await db.execute(sql`
    CREATE TABLE businesses (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      description TEXT,
      hours TEXT,
      email TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);
}

export async function down(db: PostgresJsDatabase) {
  await db.execute(sql`DROP TABLE businesses`);
}
