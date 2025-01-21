import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import {
  ClassesTable,
  NotificationsTable,
  NotificationType,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { withAuth, errorResponse } from "@/lib/utils/api-utils";

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

      // Update slots left
      const [updatedClass] = await db
        .update(ClassesTable)
        .set({ slotsLeft: classData.slotsLeft - 1 })
        .where(eq(ClassesTable.id, classId))
        .returning();

      // Create booking confirmation notification
      await db.insert(NotificationsTable).values({
        userId: user.id,
        type: NotificationType.BOOKING_CONFIRMATION,
        title: "Class Booked Successfully",
        message: `You have successfully booked ${classData.name} on ${classData.startDate} at ${classData.time}`,
        read: false,
      });

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
