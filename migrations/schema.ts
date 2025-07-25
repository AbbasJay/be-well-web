import {
  pgTable,
  uniqueIndex,
  serial,
  text,
  timestamp,
  foreignKey,
  integer,
  boolean,
  numeric,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    photo: text("photo"),
  },
  (table) => {
    return {
      uniqueIdx: uniqueIndex("unique_idx").using(
        "btree",
        table.email.asc().nullsLast()
      ),
    };
  }
);

export const classes = pgTable(
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
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    googleEventId: text("google_event_id"),
    classTypeId: integer("class_type_id"),
    classType: text("class_type"),
  },
  (table) => {
    return {
      classesBusinessIdBusinessesIdFk: foreignKey({
        columns: [table.businessId],
        foreignColumns: [businesses.id],
        name: "classes_business_id_businesses_id_fk",
      }),
    };
  }
);

export const classReviewLikes = pgTable(
  "class_review_likes",
  {
    id: serial("id").primaryKey().notNull(),
    reviewId: integer("review_id").notNull(),
    userId: integer("user_id").notNull(),
    type: text("type").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      classReviewLikesReviewIdClassReviewsIdFk: foreignKey({
        columns: [table.reviewId],
        foreignColumns: [classReviews.id],
        name: "class_review_likes_review_id_class_reviews_id_fk",
      }).onDelete("cascade"),
      classReviewLikesUserIdUsersIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
        name: "class_review_likes_user_id_users_id_fk",
      }).onDelete("cascade"),
    };
  }
);

export const classReviews = pgTable(
  "class_reviews",
  {
    id: serial("id").primaryKey().notNull(),
    classId: integer("class_id").notNull(),
    userId: integer("user_id").notNull(),
    rating: integer("rating").notNull(),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      classReviewsClassIdClassesIdFk: foreignKey({
        columns: [table.classId],
        foreignColumns: [classes.id],
        name: "class_reviews_class_id_classes_id_fk",
      }).onDelete("cascade"),
      classReviewsUserIdUsersIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
        name: "class_reviews_user_id_users_id_fk",
      }).onDelete("cascade"),
    };
  }
);

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    classId: integer("class_id").notNull(),
    status: text("status").default("active").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    cancelledAt: timestamp("cancelled_at", { mode: "string" }),
    cancellationReason: text("cancellation_reason"),
  },
  (table) => {
    return {
      bookingsUserIdUsersIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
        name: "bookings_user_id_users_id_fk",
      }),
      bookingsClassIdClassesIdFk: foreignKey({
        columns: [table.classId],
        foreignColumns: [classes.id],
        name: "bookings_class_id_classes_id_fk",
      }).onDelete("cascade"),
    };
  }
);

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey().notNull(),
    classId: integer("class_id"),
    message: text("message").notNull(),
    userId: integer("user_id").notNull(),
    read: boolean("read").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    businessId: integer("business_id"),
    title: text("title").notNull(),
    type: text("type").notNull(),
    classTypeId: integer("class_type_id"),
    className: text("class_name"),
  },
  (table) => {
    return {
      notificationsUserIdUsersIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
        name: "notifications_user_id_users_id_fk",
      }),
      notificationsClassIdClassesIdFk: foreignKey({
        columns: [table.classId],
        foreignColumns: [classes.id],
        name: "notifications_class_id_classes_id_fk",
      }).onDelete("set null"),
      notificationsBusinessIdBusinessesIdFk: foreignKey({
        columns: [table.businessId],
        foreignColumns: [businesses.id],
        name: "notifications_business_id_businesses_id_fk",
      }).onDelete("set null"),
      notificationsClassTypeIdClassesIdFk: foreignKey({
        columns: [table.classTypeId],
        foreignColumns: [classes.id],
        name: "notifications_class_type_id_classes_id_fk",
      }).onDelete("set null"),
    };
  }
);

export const businesses = pgTable(
  "businesses",
  {
    id: serial("id").primaryKey().notNull(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    phoneNumber: text("phone_number").notNull(),
    description: text("description"),
    hours: text("hours"),
    email: text("email").notNull(),
    type: text("type").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    userId: integer("user_id").notNull(),
    country: text("country"),
    zipCode: text("zip_code"),
    city: text("city"),
    state: text("state"),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    photo: text("photo"),
  },
  (table) => {
    return {
      uniqueEmailIdx: uniqueIndex("unique_email_idx").using(
        "btree",
        table.email.asc().nullsLast()
      ),
      businessesUserIdUsersIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
        name: "businesses_user_id_users_id_fk",
      }),
    };
  }
);
