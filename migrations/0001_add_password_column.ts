import { sql } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export async function up(db: PostgresJsDatabase) {
  await db.execute(
    sql`ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT ''`
  );
}

export async function down(db: PostgresJsDatabase) {
  await db.execute(sql`ALTER TABLE users DROP COLUMN password`);
}
