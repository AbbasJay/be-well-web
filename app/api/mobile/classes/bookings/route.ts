import { NextRequest } from "next/server";
import { db } from "@/lib/db/db";
import { BookingsTable, ClassesTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { withAuth, errorResponse } from "@/lib/utils/api-utils";

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      // Get all active bookings for the user with class details
      const bookings = await db
        .select({
          booking: {
            id: BookingsTable.id,
            status: BookingsTable.status,
            createdAt: BookingsTable.createdAt,
            cancelledAt: BookingsTable.cancelledAt,
          },
          class: {
            id: ClassesTable.id,
            name: ClassesTable.name,
            description: ClassesTable.description,
            startDate: ClassesTable.startDate,
            time: ClassesTable.time,
            instructor: ClassesTable.instructor,
            location: ClassesTable.location,
          },
        })
        .from(BookingsTable)
        .innerJoin(ClassesTable, eq(BookingsTable.classId, ClassesTable.id))
        .where(
          and(
            eq(BookingsTable.userId, user.id),
            eq(BookingsTable.status, "active")
          )
        )
        .orderBy(BookingsTable.createdAt);

      return Response.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return errorResponse("Failed to fetch bookings");
    }
  });
}
