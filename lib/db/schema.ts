import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  integer,
  foreignKey,
  numeric,
} from "drizzle-orm/pg-core";

export const UsersTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (users) => ({
    uniqueIdx: uniqueIndex("unique_idx").on(users.email),
  })
);

export type User = typeof UsersTable.$inferInsert;

export const BusinessesTable = pgTable(
  "businesses",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    phoneNumber: text("phone_number").notNull(),
    description: text("description"),
    hours: text("hours"),
    email: text("email").notNull(),
    type: text("type").notNull(),
    country: text("country"),
    zipCode: text("zip_code"),
    city: text("city"),
    state: text("state"),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (businesses) => ({
    uniqueEmailIdx: uniqueIndex("unique_email_idx").on(businesses.email),
    userIdFk: foreignKey({
      columns: [businesses.userId],
      foreignColumns: [UsersTable.id],
    }),
  })
);

export type Business = typeof BusinessesTable.$inferInsert;

export const ClassesTable = pgTable(
  "classes",
  {
    id: serial("id").primaryKey().notNull(),
    businessId: integer("business_id").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    duration: integer("duration").notNull(),
    price: integer("price").notNull(),
    instructor: text("instructor").notNull(),
    location: text("location").notNull(),
    startDate: text("start_date").notNull(),
    time: text("time").notNull(),
    capacity: integer("capacity").notNull(),
    slotsLeft: integer("slots_left").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    startDate: text("start_date").notNull(),
    time: text("time").notNull(),
    slotsLeft: integer("slots_left").notNull(),
    location: text("location").notNull(),
  },
  (classes) => ({
    businessIdFk: foreignKey({
      columns: [classes.businessId],
      foreignColumns: [BusinessesTable.id],
    }),
    // Optionally, add a composite unique index if needed
    // uniqueClassIdx: uniqueIndex("unique_class_idx").on(classes.businessId, classes.name),
  })
);

export type Class = typeof ClassesTable.$inferInsert;
