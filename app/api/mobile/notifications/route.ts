import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { NotificationsTable } from "@/lib/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { withAuth, errorResponse } from "@/lib/utils/api-utils";

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const notifications = await db
        .select()
        .from(NotificationsTable)
        .where(eq(NotificationsTable.userId, user.id))
        .orderBy(desc(NotificationsTable.createdAt))
        .execute();

      return NextResponse.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return errorResponse("Failed to fetch notifications");
    }
  });
}

export async function PUT(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const { notificationIds } = body;

      if (!Array.isArray(notificationIds)) {
        return errorResponse("notificationIds must be an array", 400);
      }

      // Mark notifications as read
      await db
        .update(NotificationsTable)
        .set({ read: true })
        .where(
          and(
            eq(NotificationsTable.userId, user.id),
            inArray(NotificationsTable.id, notificationIds)
          )
        )
        .execute();

      return NextResponse.json({ message: "Notifications marked as read" });
    } catch (error) {
      console.error("Error updating notifications:", error);
      return errorResponse("Failed to update notifications");
    }
  });
}

export async function DELETE(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const { notificationIds } = body;

      if (!Array.isArray(notificationIds)) {
        return errorResponse("notificationIds must be an array", 400);
      }

      // Delete notifications
      await db
        .delete(NotificationsTable)
        .where(
          and(
            eq(NotificationsTable.userId, user.id),
            inArray(NotificationsTable.id, notificationIds)
          )
        )
        .execute();

      return NextResponse.json({ message: "Notifications deleted" });
    } catch (error) {
      console.error("Error deleting notifications:", error);
      return errorResponse("Failed to delete notifications");
    }
  });
}
