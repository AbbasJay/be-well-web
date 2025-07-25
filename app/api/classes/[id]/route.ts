import { db } from "@/lib/db/db";
import { ClassesTable, BookingsTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import {
  createEventFromClassServer,
  updateEventFromClassServer,
  deleteEventFromClassServer,
} from "@/app/services/google-calendar-server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { cookies } from "next/headers";
import { uploadFileToS3 } from "@/lib/utils/s3";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = parseInt(params.id);
    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: "Invalid business ID" },
        { status: 400 }
      );
    }

    // Get all classes for the business
    const classes = await db
      .select()
      .from(ClassesTable)
      .where(eq(ClassesTable.businessId, businessId))
      .execute();

    // Get user's bookings for classes in this specific business
    const userBookings = await db
      .select({
        classId: BookingsTable.classId,
        status: BookingsTable.status,
        bookingId: BookingsTable.id,
      })
      .from(BookingsTable)
      .innerJoin(ClassesTable, eq(BookingsTable.classId, ClassesTable.id))
      .where(
        and(
          eq(BookingsTable.userId, parseInt(session.user.id)),
          eq(ClassesTable.businessId, businessId)
        )
      )
      .execute();

    // Create a map of classId to booking info
    const bookingMap = new Map();
    userBookings.forEach((booking) => {
      bookingMap.set(booking.classId, {
        isBooked: true,
        bookingStatus: booking.status,
        bookingId: booking.bookingId,
      });
    });

    // Add booking info to each class
    const classesWithBookingStatus = classes.map((classData) => ({
      ...classData,
      isBooked: bookingMap.has(classData.id),
      bookingStatus: bookingMap.get(classData.id)?.bookingStatus || null,
      bookingId: bookingMap.get(classData.id)?.bookingId || null,
    }));

    return NextResponse.json(classesWithBookingStatus);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const classId = Number(params.id);

    // Get the class data before deleting for calendar event cleanup
    const [classToDelete] = await db
      .select()
      .from(ClassesTable)
      .where(eq(ClassesTable.id, classId));

    await db.delete(ClassesTable).where(eq(ClassesTable.id, classId));

    // Delete the associated calendar event if it exists
    if (classToDelete?.googleEventId) {
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
            const deleteSuccess = await deleteEventFromClassServer(
              existingTokens.access_token,
              classToDelete.googleEventId
            );
            if (deleteSuccess) {
              console.log(
                `Calendar event deleted for class: ${classToDelete.name}`
              );
            } else {
              console.log(
                `Failed to delete calendar event for class: ${classToDelete.name}`
              );
            }
          }
        }
      } catch (calendarError) {
        console.error(
          "Failed to delete calendar event for class:",
          calendarError
        );
      }
    } else if (classToDelete) {
      console.log(
        `Class "${classToDelete.name}" deleted. No calendar event to clean up.`
      );
    }

    return NextResponse.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const classId = Number(params.id);
    const formData = await req.formData();
    const file = formData.get("photo");
    let photoUrl: string | undefined;

    // Get the current class data to preserve existing photo if no new one is uploaded
    const [currentClass] = await db
      .select()
      .from(ClassesTable)
      .where(eq(ClassesTable.id, classId));

    if (!currentClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    photoUrl = currentClass.photo || undefined; // Keep existing photo by default

    if (file instanceof Blob) {
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

    const updatedData: Partial<typeof ClassesTable.$inferInsert> = {
      classTypeId: formData.get("classTypeId")
        ? parseInt(formData.get("classTypeId") as string)
        : undefined,
      classType: formData.get("classType") as string,
      classTypeLabel: formData.get("classTypeLabel") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      duration: parseInt(formData.get("duration") as string),
      price: parseInt(formData.get("price") as string),
      instructor: formData.get("instructor") as string,
      location: formData.get("location") as string,
      startDate: formData.get("startDate") as string,
      time: formData.get("time") as string,
      capacity: parseInt(formData.get("capacity") as string),
      photo: photoUrl,
    };

    // If capacity is being updated, we need to adjust slotsLeft
    if (updatedData.capacity !== undefined) {
      const bookedSlots = currentClass.capacity - currentClass.slotsLeft;
      updatedData.slotsLeft = Math.max(0, updatedData.capacity - bookedSlots);
    }

    const [updatedClass] = await db
      .update(ClassesTable)
      .set(updatedData)
      .where(eq(ClassesTable.id, classId))
      .returning();

    // Try to update the calendar event for the updated class
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
          // Check if we have a Google Event ID stored for this class
          if (updatedClass.googleEventId) {
            // Update the existing calendar event
            const updateSuccess = await updateEventFromClassServer(
              updatedClass,
              existingTokens.access_token,
              updatedClass.googleEventId
            );
            if (updateSuccess) {
              console.log(
                `Calendar event updated for class: ${updatedClass.name}`
              );
            } else {
              console.log(
                `Failed to update calendar event for class: ${updatedClass.name}`
              );
            }
          } else {
            // Create a new calendar event if we don't have an existing one
            const calendarEventId = await createEventFromClassServer(
              updatedClass,
              existingTokens.access_token
            );
            if (calendarEventId) {
              console.log(
                `New calendar event created with ID: ${calendarEventId}`
              );

              // Store the Google Event ID in the database
              await db
                .update(ClassesTable)
                .set({ googleEventId: calendarEventId })
                .where(eq(ClassesTable.id, updatedClass.id));

              console.log(
                `Stored Google Event ID for class ${updatedClass.id}`
              );
            }
          }
        } else {
          console.log("No Google Calendar access token found for user");
        }
      }
    } catch (calendarError) {
      console.error(
        "Failed to update calendar event for class:",
        calendarError
      );
      // Don't fail the class update if calendar event update fails
    }

    return NextResponse.json({
      message: "Class updated successfully",
      class: updatedClass,
    });
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
