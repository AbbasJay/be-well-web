import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import {
  BookingsTable,
  ClassesTable,
  NotificationsTable,
  NotificationType,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookingId = parseInt(params.id);
    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const [booking] = await db
      .select()
      .from(BookingsTable)
      .where(
        and(
          eq(BookingsTable.id, bookingId),
          eq(BookingsTable.userId, parseInt(session.user.id))
        )
      )
      .execute();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookingId = parseInt(params.id);
    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const [booking] = await db
      .select()
      .from(BookingsTable)
      .where(
        and(
          eq(BookingsTable.id, bookingId),
          eq(BookingsTable.userId, parseInt(session.user.id))
        )
      )
      .execute();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    // Get the class to update slots
    const [classData] = await db
      .select()
      .from(ClassesTable)
      .where(eq(ClassesTable.id, booking.classId))
      .execute();

    if (!classData) {
      return NextResponse.json(
        { error: "Associated class not found" },
        { status: 404 }
      );
    }

    const [updatedBooking] = await db
      .update(BookingsTable)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationReason: "User cancelled booking",
      })
      .where(eq(BookingsTable.id, bookingId))
      .returning();

    const [updatedClass] = await db
      .update(ClassesTable)
      .set({ slotsLeft: classData.slotsLeft + 1 })
      .where(eq(ClassesTable.id, booking.classId))
      .returning();

    await db.insert(NotificationsTable).values({
      userId: parseInt(session.user.id),
      classId: booking.classId,
      businessId: classData.businessId,
      type: NotificationType.CLASS_CANCELLED,
      title: "Booking Cancelled",
      message: `Your booking for ${classData.name} has been cancelled.`,
      read: false,
    });

    return NextResponse.json({
      message: "Booking cancelled successfully",
      booking: updatedBooking,
      class: updatedClass,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
