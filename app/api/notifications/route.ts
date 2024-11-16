import { db } from "@/lib/db/db";
import { NotificationsTable } from "@/lib/db/schema";
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

export async function PUT(req: Request) {
  try {
    const newNotification = await req.json();

    const insertedNotification = await db
      .insert(NotificationsTable)
      .values(newNotification)
      .returning();

    return NextResponse.json(insertedNotification);
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}
