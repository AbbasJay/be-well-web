import { db } from "@/lib/db/db";
import { NotificationsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Fetching notifications for userId:", params.id);
    console.log("Request headers:", Object.fromEntries(req.headers));

    const notifications = await db
      .select()
      .from(NotificationsTable)
      .where(eq(NotificationsTable.userId, Number(params.id)))
      .orderBy(NotificationsTable.createdAt);

    console.log("Found notifications:", notifications);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Mark specific notification as read
    const updatedNotification = await db
      .update(NotificationsTable)
      .set({ read: true })
      .where(eq(NotificationsTable.id, Number(params.id)))
      .returning();

    if (!updatedNotification.length) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedNotification[0]);
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { title, message, type, businessId } = body;

    // Validate required fields
    if (!title || !message || !businessId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newNotification = await db
      .insert(NotificationsTable)
      .values({
        title,
        message,
        type: type || "SYSTEM",
        businessId: Number(businessId),
        userId: Number(params.id),
        read: false,
      })
      .returning();

    return NextResponse.json(newNotification[0], { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
