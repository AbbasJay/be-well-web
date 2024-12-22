import { db } from "@/lib/db/db";
import { NotificationsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user
    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get notifications for the specific user
    const notifications = await db
      .select()
      .from(NotificationsTable)
      .where(eq(NotificationsTable.userId, Number(params.id)))
      .orderBy(NotificationsTable.createdAt);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
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
      { 
        error: "Internal Server Error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
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
        type: type || "SYSTEM", // Default to SYSTEM if not provided
        businessId: Number(businessId),
        userId: Number(params.id),
        read: false,
      })
      .returning();

    console.log("Created notification:", newNotification[0]); // Debug log
    return NextResponse.json(newNotification[0], { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
