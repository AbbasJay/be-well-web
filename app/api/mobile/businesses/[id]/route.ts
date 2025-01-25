import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { BusinessesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { errorResponse } from "@/lib/utils/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = parseInt(params.id);
    if (isNaN(businessId)) {
      return errorResponse("Invalid business ID", 400);
    }

    const [business] = await db
      .select()
      .from(BusinessesTable)
      .where(eq(BusinessesTable.id, businessId))
      .execute();

    if (!business) {
      return errorResponse("Business not found", 404);
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error("Error fetching business:", error);
    return errorResponse("Failed to fetch business");
  }
}
