import { relations } from "drizzle-orm/relations";
import { businesses, classes, classReviews, classReviewLikes, users, bookings, notifications } from "./schema";

export const classesRelations = relations(classes, ({one, many}) => ({
	business: one(businesses, {
		fields: [classes.businessId],
		references: [businesses.id]
	}),
	classReviews: many(classReviews),
	bookings: many(bookings),
	notifications_classId: many(notifications, {
		relationName: "notifications_classId_classes_id"
	}),
	notifications_classTypeId: many(notifications, {
		relationName: "notifications_classTypeId_classes_id"
	}),
}));

export const businessesRelations = relations(businesses, ({one, many}) => ({
	classes: many(classes),
	notifications: many(notifications),
	user: one(users, {
		fields: [businesses.userId],
		references: [users.id]
	}),
}));

export const classReviewLikesRelations = relations(classReviewLikes, ({one}) => ({
	classReview: one(classReviews, {
		fields: [classReviewLikes.reviewId],
		references: [classReviews.id]
	}),
	user: one(users, {
		fields: [classReviewLikes.userId],
		references: [users.id]
	}),
}));

export const classReviewsRelations = relations(classReviews, ({one, many}) => ({
	classReviewLikes: many(classReviewLikes),
	class: one(classes, {
		fields: [classReviews.classId],
		references: [classes.id]
	}),
	user: one(users, {
		fields: [classReviews.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	classReviewLikes: many(classReviewLikes),
	classReviews: many(classReviews),
	bookings: many(bookings),
	notifications: many(notifications),
	businesses: many(businesses),
}));

export const bookingsRelations = relations(bookings, ({one}) => ({
	user: one(users, {
		fields: [bookings.userId],
		references: [users.id]
	}),
	class: one(classes, {
		fields: [bookings.classId],
		references: [classes.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
	class_classId: one(classes, {
		fields: [notifications.classId],
		references: [classes.id],
		relationName: "notifications_classId_classes_id"
	}),
	business: one(businesses, {
		fields: [notifications.businessId],
		references: [businesses.id]
	}),
	class_classTypeId: one(classes, {
		fields: [notifications.classTypeId],
		references: [classes.id],
		relationName: "notifications_classTypeId_classes_id"
	}),
}));