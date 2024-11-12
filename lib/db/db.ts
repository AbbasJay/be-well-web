import "../../envConfig";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

export const db = drizzle(sql, { schema });

export const getUsers = async () => {
  return db.select().from(schema.UsersTable);
};

export const getBusinesses = async () => {
  return db.select().from(schema.BusinessesTable);
};

export const getClassesForBusiness = async (businessId: number) => {
  return db
    .select()
    .from(schema.ClassesTable)
    .where(eq(schema.ClassesTable.businessId, businessId));
};
