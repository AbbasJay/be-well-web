import { NextRequest } from "next/server";
import { db } from "@/lib/db/db";
import { BookingsTable, ClassesTable, BusinessesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { withAuth, errorResponse } from "@/lib/utils/api-utils";

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const bookings = await db
        .select({
          id: BookingsTable.id,
          status: BookingsTable.status,
          createdAt: BookingsTable.createdAt,
          cancelledAt: BookingsTable.cancelledAt,
          cancellationReason: BookingsTable.cancellationReason,
          classId: ClassesTable.id,
          className: ClassesTable.name,
          classDescription: ClassesTable.description,
          classStartDate: ClassesTable.startDate,
          classTime: ClassesTable.time,
          classInstructor: ClassesTable.instructor,
          classLocation: ClassesTable.location,
          businessId: BusinessesTable.id,
          businessName: BusinessesTable.name,
        })
        .from(BookingsTable)
        .innerJoin(ClassesTable, eq(BookingsTable.classId, ClassesTable.id))
        .innerJoin(
          BusinessesTable,
          eq(ClassesTable.businessId, BusinessesTable.id)
        )
        .where(eq(BookingsTable.userId, user.id))
        .orderBy(BookingsTable.createdAt);

      return Response.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return errorResponse("Failed to fetch bookings");
    }
  });
}
