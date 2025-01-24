import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  integer,
  foreignKey,
  numeric,
  boolean,
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
    photo: text("photo"),
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
  },
  (classes) => ({
    businessIdFk: foreignKey({
      columns: [classes.businessId],
      foreignColumns: [BusinessesTable.id],
    }),
  })
);

export type Class = typeof ClassesTable.$inferInsert;

export const NotificationsTable = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    classId: integer("class_id"),
    businessId: integer("business_id"),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: text("type").notNull(),
    read: boolean("read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (notifications) => ({
    userIdFk: foreignKey({
      columns: [notifications.userId],
      foreignColumns: [UsersTable.id],
    }),
    classIdFk: foreignKey({
      columns: [notifications.classId],
      foreignColumns: [ClassesTable.id],
    }).onDelete("set null"),
    businessIdFk: foreignKey({
      columns: [notifications.businessId],
      foreignColumns: [BusinessesTable.id],
    }).onDelete("set null"),
  })
);

export const NotificationType = {
  BOOKING_CONFIRMATION: "booking_confirmation",
  BOOKING_REMINDER: "booking_reminder",
  CLASS_CANCELLED: "class_cancelled",
  CLASS_UPDATED: "class_updated",
  SYSTEM: "system",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];
export type Notification = typeof NotificationsTable.$inferInsert;
