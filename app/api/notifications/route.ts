import { db } from "@/lib/db/db";
import { NotificationsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const notifications = await db.select().from(NotificationsTable);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const newNotification = await req.json();
    console.log("New notification:", newNotification);
    const insertedNotification = await db
      .insert(NotificationsTable)
      .values(newNotification)
      .returning();

    return NextResponse.json(insertedNotification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const updatedNotification = await req.json();

    const updated = await db
      .update(NotificationsTable)
      .set(updatedNotification)
      .where(eq(NotificationsTable.id, updatedNotification.id))
      .returning();

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    await db.delete(NotificationsTable).where(eq(NotificationsTable.id, id));

    return NextResponse.json(
      { message: "Notification deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
