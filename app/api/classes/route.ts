import { db } from "@/lib/db/db";
import { ClassesTable } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createEventFromClassServer } from "@/app/services/google-calendar-server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth";
import { cookies } from "next/headers";
import { uploadFileToS3 } from "@/lib/utils/s3";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("photo");
    let photoUrl: string | undefined;

    if (file instanceof Blob) {
      console.log("Processing photo:", {
        type: file.type,
        size: file.size,
      });

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${file.type.split("/")[1]}`;

        photoUrl = await uploadFileToS3(
          buffer,
          fileName,
          file.type,
          "class-photos"
        );
        console.log("Successfully uploaded photo to S3:", photoUrl);
      } catch (uploadError) {
        console.error("Error uploading to S3:", uploadError);
        return NextResponse.json(
          {
            error: "Failed to upload photo",
            details:
              uploadError instanceof Error
                ? uploadError.message
                : "Unknown error",
          },
          { status: 500 }
        );
      }
    }

    const newClass = {
      classTypeId: formData.get("classTypeId")
        ? parseInt(formData.get("classTypeId") as string)
        : undefined,
      classType: formData.get("classType") as string,
      classTypeLabel: formData.get("classTypeLabel") as string,
      businessId: parseInt(formData.get("businessId") as string),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      duration: parseInt(formData.get("duration") as string),
      price: parseInt(formData.get("price") as string),
      instructor: formData.get("instructor") as string,
      location: formData.get("location") as string,
      startDate: formData.get("startDate") as string,
      time: formData.get("time") as string,
      capacity: parseInt(formData.get("capacity") as string),
      slotsLeft: parseInt(formData.get("capacity") as string),
      photo: photoUrl,
    };

    const [insertedClass] = await db
      .insert(ClassesTable)
      .values(newClass)
      .returning();

    const [existingType] = await db
      .select()
      .from(ClassesTable)
      .where(
        and(
          eq(ClassesTable.businessId, insertedClass.businessId),
          eq(ClassesTable.name, insertedClass.name),
          eq(ClassesTable.instructor, insertedClass.instructor),
          eq(ClassesTable.location, insertedClass.location),
          ne(ClassesTable.id, insertedClass.id)
        )
      )
      .limit(1)
      .execute();

    let classTypeId;
    if (existingType) {
      classTypeId = existingType.classTypeId || existingType.id;
    } else {
      classTypeId = insertedClass.id;
    }

    await db
      .update(ClassesTable)
      .set({ classTypeId })
      .where(eq(ClassesTable.id, insertedClass.id));

    insertedClass.classTypeId = classTypeId;

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
            insertedClass,
            existingTokens.access_token
          );
          if (calendarEventId) {
            console.log(`Calendar event created with ID: ${calendarEventId}`);

            // Store the Google Event ID in the database
            await db
              .update(ClassesTable)
              .set({ googleEventId: calendarEventId })
              .where(eq(ClassesTable.id, insertedClass.id));

            console.log(`Stored Google Event ID for class ${insertedClass.id}`);
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

    return NextResponse.json([insertedClass], { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
