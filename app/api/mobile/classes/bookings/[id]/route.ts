import { NextRequest } from "next/server";
import { db } from "@/lib/db/db";
import {
  BookingsTable,
  ClassesTable,
  NotificationsTable,
  NotificationType,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { withAuth, errorResponse } from "@/lib/utils/api-utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (user) => {
    try {
      const bookingId = parseInt(params.id);
      if (isNaN(bookingId)) {
        return errorResponse("Invalid booking ID", 400);
      }

      // Get the booking and check if it exists and belongs to the user
      const [booking] = await db
        .select()
        .from(BookingsTable)
        .where(
          and(
            eq(BookingsTable.id, bookingId),
            eq(BookingsTable.userId, user.id)
          )
        )
        .execute();

      if (!booking) {
        return errorResponse("Booking not found", 404);
      }

      if (booking.status === "cancelled") {
        return errorResponse("Booking is already cancelled", 400);
      }

      // Get the class to update slots
      const [classData] = await db
        .select()
        .from(ClassesTable)
        .where(eq(ClassesTable.id, booking.classId))
        .execute();

      if (!classData) {
        return errorResponse("Associated class not found", 404);
      }

      // Update the booking status
      const [updatedBooking] = await db
        .update(BookingsTable)
        .set({
          status: "cancelled",
          cancelledAt: new Date(),
          cancellationReason: "User cancelled booking",
        })
        .where(eq(BookingsTable.id, bookingId))
        .returning();

      // Increase available slots
      const [updatedClass] = await db
        .update(ClassesTable)
        .set({ slotsLeft: classData.slotsLeft + 1 })
        .where(eq(ClassesTable.id, booking.classId))
        .returning();

      // Create cancellation notification
      await db.insert(NotificationsTable).values({
        userId: user.id,
        classId: booking.classId,
        type: NotificationType.CLASS_CANCELLED,
        title: "Booking Cancelled",
        message: `Your booking for ${classData.name} has been cancelled.`,
        read: false,
      });

      return Response.json({
        message: "Booking cancelled successfully",
        booking: updatedBooking,
        class: updatedClass,
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      return errorResponse("Failed to cancel booking");
    }
  });
}
