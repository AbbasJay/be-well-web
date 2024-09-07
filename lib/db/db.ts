import "@/drizzle/envConfig";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import * as schema from "./schema";
import { UsersTable } from "./schema";

export const db = drizzle(sql, { schema });

export const getUsers = async () => {
  return db.select().from(UsersTable);
};
