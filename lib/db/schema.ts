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
    photo: text("photo"), // avatar URL, optional
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
    classTypeId: integer("class_type_id"),
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
    googleEventId: text("google_event_id"),
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

export const BookingsTable = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    classId: integer("class_id").notNull(),
    status: text("status")
      .notNull()
      .$type<"active" | "cancelled" | "completed" | "no-show">()
      .default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    cancelledAt: timestamp("cancelled_at"),
    cancellationReason: text("cancellation_reason"),
  },
  (bookings) => ({
    userIdFk: foreignKey({
      columns: [bookings.userId],
      foreignColumns: [UsersTable.id],
    }),
    classIdFk: foreignKey({
      columns: [bookings.classId],
      foreignColumns: [ClassesTable.id],
    }).onDelete("cascade"),
  })
);

export type Booking = typeof BookingsTable.$inferInsert;

export const NotificationsTable = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    classId: integer("class_id"),
    classTypeId: integer("class_type_id"), // New field for referencing class types
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
    classTypeIdFk: foreignKey({
      columns: [notifications.classTypeId],
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

export const ClassReviewsTable = pgTable(
  "class_reviews",
  {
    id: serial("id").primaryKey().notNull(),
    classId: integer("class_id").notNull(),
    userId: integer("user_id").notNull(),
    rating: integer("rating").notNull(), // 1-5
    text: text("text").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (reviews) => ({
    classIdFk: foreignKey({
      columns: [reviews.classId],
      foreignColumns: [ClassesTable.id],
    }).onDelete("cascade"),
    userIdFk: foreignKey({
      columns: [reviews.userId],
      foreignColumns: [UsersTable.id],
    }).onDelete("cascade"),
  })
);

export type ClassReview = typeof ClassReviewsTable.$inferInsert;

export const ClassReviewLikesTable = pgTable(
  "class_review_likes",
  {
    id: serial("id").primaryKey().notNull(),
    reviewId: integer("review_id").notNull(),
    userId: integer("user_id").notNull(),
    type: text("type").notNull().$type<"like" | "dislike">(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (likes) => ({
    reviewIdFk: foreignKey({
      columns: [likes.reviewId],
      foreignColumns: [ClassReviewsTable.id],
    }).onDelete("cascade"),
    userIdFk: foreignKey({
      columns: [likes.userId],
      foreignColumns: [UsersTable.id],
    }).onDelete("cascade"),
  })
);

export type ClassReviewLike = typeof ClassReviewLikesTable.$inferInsert;
