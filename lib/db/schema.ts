import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const UsersTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (users) => {
    return {
      uniqueIdx: uniqueIndex("unique_idx").on(users.email),
    };
  }
);

export type User = typeof UsersTable.$inferInsert;

export const BusinessesTable = pgTable(
  "businesses",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    phoneNumber: text("phone_number").notNull(),
    description: text("description"),
    hours: text("hours"),
    email: text("email").notNull(),
    type: text("type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (businesses) => {
    return {
      uniqueEmailIdx: uniqueIndex("unique_email_idx").on(businesses.email),
    };
  }
);

export type Business = typeof BusinessesTable.$inferInsert;
