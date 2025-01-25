import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { BusinessesTable } from "@/lib/db/schema";
import { withAuth, errorResponse } from "@/lib/utils/api-utils";

export async function GET() {
  try {
    // Get all businesses
    const businesses = await db.select().from(BusinessesTable).execute();
    return NextResponse.json(businesses);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return errorResponse("Failed to fetch businesses");
  }
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();

      const businessData = {
        ...body,
        userId: user.id,
      };

      const [business] = await db
        .insert(BusinessesTable)
        .values(businessData)
        .returning();

      return NextResponse.json(business, { status: 201 });
    } catch (error) {
      console.error("Error creating business:", error);
      return errorResponse("Failed to create business");
    }
  });
}
