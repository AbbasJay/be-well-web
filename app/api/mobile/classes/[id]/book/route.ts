import { NextRequest } from "next/server";
import { db } from "@/lib/db/db";
import {
  ClassesTable,
  NotificationsTable,
  NotificationType,
  UsersTable,
  BusinessesTable,
  BookingsTable,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { withAuth, errorResponse } from "@/lib/utils/api-utils";
import { sendBookingConfirmationEmail } from "@/lib/utils/email";

// Get booking ID for a class
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (user) => {
    try {
      const classId = parseInt(params.id);
      if (isNaN(classId)) {
        return errorResponse("Invalid class ID", 400);
      }

      // Find active booking for this user and class
      const [booking] = await db
        .select()
        .from(BookingsTable)
        .where(
          and(
            eq(BookingsTable.userId, user.id),
            eq(BookingsTable.classId, classId),
            eq(BookingsTable.status, "active")
          )
        )
        .execute();

      if (!booking) {
        return errorResponse("No active booking found for this class", 404);
      }

      return Response.json({ bookingId: booking.id });
    } catch (error) {
      console.error("Error fetching booking:", error);
      return errorResponse("Failed to fetch booking");
    }
  });
}

// Book a class
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (user) => {
    try {
      const classId = parseInt(params.id);
      if (isNaN(classId)) {
        return errorResponse("Invalid class ID", 400);
      }

      // Get class and check availability
      const [classData] = await db
        .select()
        .from(ClassesTable)
        .where(eq(ClassesTable.id, classId))
        .execute();

      if (!classData) {
        return errorResponse("Class not found", 404);
      }

      if (classData.slotsLeft <= 0) {
        return errorResponse("Class is full", 400);
      }

      // Check if user has already booked this class and it's still active
      const existingBooking = await db
        .select()
        .from(BookingsTable)
        .where(
          and(
            eq(BookingsTable.userId, user.id),
            eq(BookingsTable.classId, classId),
            eq(BookingsTable.status, "active")
          )
        )
        .execute();

      if (existingBooking.length > 0) {
        return errorResponse("You have already booked this class", 400);
      }

      // Get user email
      const [userData] = await db
        .select()
        .from(UsersTable)
        .where(eq(UsersTable.id, user.id))
        .execute();

      if (!userData?.email) {
        return errorResponse("User email not found", 404);
      }

      // Get business details
      const [businessData] = await db
        .select()
        .from(BusinessesTable)
        .where(eq(BusinessesTable.id, classData.businessId))
        .execute();

      if (!businessData) {
        return errorResponse("Business not found", 404);
      }

      // Create booking record
      const [booking] = await db
        .insert(BookingsTable)
        .values({
          userId: user.id,
          classId: classId,
          status: "active",
        })
        .returning();

      // Update slots left
      const [updatedClass] = await db
        .update(ClassesTable)
        .set({ slotsLeft: classData.slotsLeft - 1 })
        .where(eq(ClassesTable.id, classId))
        .returning();

      // Create booking confirmation notification
      await db.insert(NotificationsTable).values({
        userId: user.id,
        classId: classId,
        businessId: classData.businessId,
        type: NotificationType.BOOKING_CONFIRMATION,
        title: "Class Booked Successfully",
        message: `You have successfully booked ${classData.name}. The class is scheduled for ${classData.startDate} at ${classData.time} with instructor ${classData.instructor}. Location: ${classData.location}`,
        read: false,
      });

      // Send confirmation email
      try {
        await sendBookingConfirmationEmail({
          userEmail: userData.email,
          className: classData.name,
          startDate: classData.startDate,
          time: classData.time,
          instructor: classData.instructor,
          location: classData.location,
          businessName: businessData.name,
          name: userData.name,
          cancellationPolicy:
            "Please contact us at " +
            businessData.email +
            " for cancellations or rescheduling.",
        });
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Continue even if email fails
      }

      return Response.json({
        message: "Class booked successfully",
        class: updatedClass,
        booking: {
          id: booking.id,
          status: booking.status,
          createdAt: booking.createdAt,
        },
      });
    } catch (error) {
      console.error("Error booking class:", error);
      return errorResponse("Failed to book class");
    }
  });
}
