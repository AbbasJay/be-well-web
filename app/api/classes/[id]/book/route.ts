import { NextRequest, NextResponse } from "next/server";
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
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { sendBookingConfirmationEmail } from "@/lib/utils/email";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const classId = parseInt(params.id);
    if (isNaN(classId)) {
      return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
    }

    // Get class and check availability
    const [classData] = await db
      .select()
      .from(ClassesTable)
      .where(eq(ClassesTable.id, classId))
      .execute();

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    if (classData.slotsLeft <= 0) {
      return NextResponse.json({ error: "Class is full" }, { status: 400 });
    }

    // Check if user has already booked this class and it's still active
    const existingBooking = await db
      .select()
      .from(BookingsTable)
      .where(
        and(
          eq(BookingsTable.userId, parseInt(session.user.id)),
          eq(BookingsTable.classId, classId),
          eq(BookingsTable.status, "active")
        )
      )
      .execute();

    if (existingBooking.length > 0) {
      return NextResponse.json(
        { error: "You have already booked this class" },
        { status: 400 }
      );
    }

    // Get user email
    const [userData] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.id, parseInt(session.user.id)))
      .execute();

    if (!userData?.email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 404 }
      );
    }

    // Get business details
    const [businessData] = await db
      .select()
      .from(BusinessesTable)
      .where(eq(BusinessesTable.id, classData.businessId))
      .execute();

    if (!businessData) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Create booking record
    const [booking] = await db
      .insert(BookingsTable)
      .values({
        userId: parseInt(session.user.id),
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
      userId: parseInt(session.user.id),
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

    return NextResponse.json({
      message: "Class booked successfully",
      class: updatedClass,
      booking: booking,
    });
  } catch (error) {
    console.error("Error booking class:", error);
    return NextResponse.json(
      { error: "Failed to book class" },
      { status: 500 }
    );
  }
}
