/**
 * @swagger
 * /api/mobile/classes:
 *   get:
 *     summary: Get classes for a specific business
 *     description: Retrieves all classes associated with a given business ID
 *     parameters:
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business to get classes for
 *     responses:
 *       200:
 *         description: List of classes for the business
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   businessId:
 *                     type: number
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   duration:
 *                     type: number
 *                   price:
 *                     type: number
 *       400:
 *         description: Bad request - Invalid or missing business ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
import { NextRequest } from "next/server";
import { db } from "@/lib/db/db";
import { ClassesTable, BookingsTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { withAuth, errorResponse } from "@/lib/utils/api-utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const businessId = searchParams.get("businessId");

      if (!businessId) {
        return errorResponse("Business ID is required");
      }

      const parsedId = parseInt(businessId);
      if (isNaN(parsedId)) {
        return errorResponse("Invalid business ID format");
      }

      // Get all classes for the business
      const classes = await db
        .select()
        .from(ClassesTable)
        .where(eq(ClassesTable.businessId, parsedId))
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
            eq(BookingsTable.userId, user.id),
            eq(ClassesTable.businessId, parsedId)
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

      // Debug logging
      console.log("=== MOBILE CLASSES DEBUG ===");
      console.log("User ID:", user.id);
      console.log("Business ID:", parsedId);
      console.log("Total classes:", classes.length);
      console.log("User bookings:", userBookings.length);
      console.log("User bookings details:", userBookings);
      console.log("Booking map:", Object.fromEntries(bookingMap));
      console.log(
        "Classes with booking status:",
        classesWithBookingStatus.map((c) => ({
          id: c.id,
          name: c.name,
          isBooked: c.isBooked,
          bookingStatus: c.bookingStatus,
          bookingId: c.bookingId,
        }))
      );
      console.log("=== END MOBILE CLASSES DEBUG ===");

      return Response.json(classesWithBookingStatus);
    } catch (error) {
      console.error("Error fetching classes:", error);
      return errorResponse("Failed to fetch classes");
    }
  });
}
