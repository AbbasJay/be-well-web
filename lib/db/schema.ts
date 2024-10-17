import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  integer,
  foreignKey,
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
    id: serial("id").primaryKey(),
    businessId: integer("business_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    price: integer("price").notNull(), // Store price in cents
    instructor: text("instructor"),
    duration: integer("duration").notNull(), // Duration in minutes
    capacity: integer("capacity").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (classes) => ({
    businessIdFk: foreignKey({
      columns: [classes.businessId],
      foreignColumns: [BusinessesTable.id],
    }),
  })
);

export const SchedulesTable = pgTable(
  "schedules",
  {
    id: serial("id").primaryKey(),
    classId: integer("class_id").notNull(),
    dayOfWeek: integer("day_of_week").notNull(), // 0-6 for Sunday-Saturday
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (schedules) => ({
    classIdFk: foreignKey({
      columns: [schedules.classId],
      foreignColumns: [ClassesTable.id],
    }),
  })
);

export type Class = typeof ClassesTable.$inferInsert;
export type Schedule = typeof SchedulesTable.$inferInsert;
