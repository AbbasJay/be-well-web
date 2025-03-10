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
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { ClassesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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

    const classes = await db
      .select()
      .from(ClassesTable)
      .where(eq(ClassesTable.businessId, parsedId))
      .execute();
    return NextResponse.json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return errorResponse("Failed to fetch classes");
  }
}
