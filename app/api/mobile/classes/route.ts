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
import { errorResponse } from "@/lib/utils/api-utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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

    let user = null;
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const jwt = await import("jsonwebtoken");
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your-secret-key"
        );
        if (decoded && typeof decoded === "object" && "id" in decoded) {
          user = decoded;
        }
      } catch (e) {
        user = null;
      }
    }

    if (!user) {
      // Not authenticated, just return classes
      return Response.json(classes);
    }

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

    const bookingMap = new Map();
    userBookings.forEach((booking) => {
      bookingMap.set(booking.classId, {
        isBooked: true,
        bookingStatus: booking.status,
        bookingId: booking.bookingId,
      });
    });

    const classesWithBookingStatus = classes.map((classData) => ({
      ...classData,
      isBooked: bookingMap.has(classData.id),
      bookingStatus: bookingMap.get(classData.id)?.bookingStatus || null,
      bookingId: bookingMap.get(classData.id)?.bookingId || null,
    }));

    return Response.json(classesWithBookingStatus);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return errorResponse("Failed to fetch classes");
  }
}
