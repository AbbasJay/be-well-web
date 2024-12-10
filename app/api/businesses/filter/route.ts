import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/db";
import { Business, BusinessesTable } from "@/lib/db/schema";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";


/**
 * @swagger
 * /api/businesses/filter:
 *   post:
 *     summary: Filter businesses based on provided criteria
 *     description: Accepts filtering parameters such as user location, max distance, minimum rating, and gym types.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: object
 *                 description: The user's location coordinates.
 *                 properties:
 *                   lat:
 *                     type: number
 *                     format: float
 *                     description: Latitude of the user location.
 *                   lng:
 *                     type: number
 *                     format: float
 *                     description: Longitude of the user location.
 *                 required:
 *                   - lat
 *                   - lng
 *               maxDistance:
 *                 type: number
 *                 description: The maximum distance (in kilometers or miles) within which to return businesses.
 *               minRating:
 *                 type: number
 *                 description: The minimum rating (1-5) for returned businesses.
 *               type:
 *                 type: string
 *                 description: A list of gym types or categories to filter by.
 *             example:
 *               location: { "lat": 51.072, "lng": 0.1276 }
 *               maxDistance: 3
 *               minRating: 4
 *               type: "gymAndClasses"
 *     responses:
 *       200:
 *         description: Filtering request successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Filtering request successful"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
export async function POST(req: Request){
    try {

        // get the parameters from the request body
        const { location, maxDistance, minRating, type } = await req.json();
        const { lat, lng } = location;
        
        console.log("Location:", location);
        console.log("Max distance:", maxDistance);
        console.log("Min rating:", minRating);
        console.log("Types:", type);

        // throw error if any of the required fields are missing
        if (!lat || !lng || !maxDistance || !minRating || !type) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // get the businesses that match the filtering criteria
        const businesses = await db
            .select()
            .from(BusinessesTable)
            .where(eq(BusinessesTable.type, type))
            .execute();

        // return the filtered businesses
        return NextResponse.json(businesses, { status: 200 });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        ); 
    }
}

