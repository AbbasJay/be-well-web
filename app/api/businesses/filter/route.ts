import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { db } from "@/lib/db/db";
import { BusinessesTable } from "@/lib/db/schema";
import haversine from "haversine-distance"
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";


const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    return haversine({ latitude: lat1, longitude: lon1 }, { latitude: lat2, longitude: lon2 });
}

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
 *                 description: The maximum distance (in meters) within which to return businesses.
 *               minRating:
 *                 type: number
 *                 description: The minimum rating (1-5) for returned businesses.
 *               types:
 *                 type: string[]
 *                 description: A list of gym types or categories to filter by. E.g ["gym", "classes"]
 *             example:
 *               location: { "lat": 51.072, "lng": 0.1276 }
 *               maxDistance: 3
 *               minRating: 4
 *               type: ["gym", "classes"]
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
        const { location, maxDistance, minRating, types } = await req.json();
        const { lat, lng } = location;

        // Helper function to validate required parameters
        const validateParams = (params: Record<string, any>) => {
            for (const [key, value] of Object.entries(params)) {
                if (value === undefined || value === null) {
                    return { error: `Missing ${key}`, status: 400 };
                }
            }
            return null;
        };

        // Validate parameters
        const validationError = validateParams({ lat, lng, maxDistance, minRating, types });
        if (validationError) {
            return NextResponse.json(validationError, { status: 400 });
        }

        if (types.includes("gym") && types.includes("classes")) {
            types.push("gymAndClasses")
        }

        const conditions = types.map((type: string) => eq(BusinessesTable.type, type));

        // get the businesses that match the filtering criteria
        const businesses = await db
            .select()
            .from(BusinessesTable)
            .where(or(...conditions))
            // TODO: filtering by rating
            .execute();

        //calculate distance between user location and the businesses
        // and filter out businesses that are beyond the maximum distance
        // from the user
        // we use haversine formula to calculate the distance
        const filtered_businesses = businesses.filter(
            (business) => 
                calculateDistance(
                    parseFloat(business.latitude!),
                    parseFloat(business.longitude!), 
                    lat, 
                    lng
                ) <= maxDistance
        );

        console.log(filtered_businesses);

        // return the filtered businesses
        return NextResponse.json(filtered_businesses, { status: 200 });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        ); 
    }
}

