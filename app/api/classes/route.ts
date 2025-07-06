import { db } from "@/lib/db/db";
import { ClassesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createEventFromClassServer } from "@/app/services/google-calendar-server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const newClass = await req.json();
    newClass.slotsLeft = newClass.capacity;

    const insertedClass = await db
      .insert(ClassesTable)
      .values(newClass)
      .returning();

    // Try to create a calendar event for the new class
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        const cookieStore = cookies();
        const tokensCookie = cookieStore.get(
          `google_calendar_tokens_${session.user.id}`
        );
        const existingTokens = tokensCookie
          ? JSON.parse(tokensCookie.value)
          : null;

        if (existingTokens?.access_token) {
          const calendarEventId = await createEventFromClassServer(
            insertedClass[0],
            existingTokens.access_token
          );
          if (calendarEventId) {
            console.log(`Calendar event created with ID: ${calendarEventId}`);

            // Store the Google Event ID in the database
            await db
              .update(ClassesTable)
              .set({ googleEventId: calendarEventId })
              .where(eq(ClassesTable.id, insertedClass[0].id));

            console.log(
              `Stored Google Event ID for class ${insertedClass[0].id}`
            );
          }
        } else {
          console.log("No Google Calendar access token found for user");
        }
      }
    } catch (calendarError) {
      console.error(
        "Failed to create calendar event for class:",
        calendarError
      );
      // Don't fail the class creation if calendar event creation fails
    }

    return NextResponse.json(insertedClass, { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
