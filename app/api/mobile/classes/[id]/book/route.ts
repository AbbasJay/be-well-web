import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import {
  ClassesTable,
  NotificationsTable,
  NotificationType,
  UsersTable,
  BusinessesTable,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { withAuth, errorResponse } from "@/lib/utils/api-utils";
import { sendBookingConfirmationEmail } from "@/lib/utils/email";

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

      // Update slots left
      const [updatedClass] = await db
        .update(ClassesTable)
        .set({ slotsLeft: classData.slotsLeft - 1 })
        .where(eq(ClassesTable.id, classId))
        .returning();

      try {
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
            cancellationPolicy:
              "Please contact us at " +
              businessData.email +
              " for cancellations or rescheduling.",
          });
          console.log(
            "Booking confirmation email sent successfully to:",
            userData.email
          );
        } catch (emailError) {
          console.error("Error sending confirmation email:", {
            error: emailError,
            emailConfig: {
              to: userData.email,
              className: classData.name,
              businessName: businessData.name,
            },
          });
        }
      } catch (error) {
        console.error("Error creating notification:", error);
      }

      return NextResponse.json({
        message: "Class booked successfully",
        class: updatedClass,
      });
    } catch (error) {
      console.error("Error booking class:", error);
      return errorResponse("Failed to book class");
    }
  });
}
