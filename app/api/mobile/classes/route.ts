import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { ClassesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { errorResponse } from "@/lib/utils/api-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");

    if (businessId) {
      const parsedId = parseInt(businessId);
      if (!isNaN(parsedId)) {
        const classes = await db
          .select()
          .from(ClassesTable)
          .where(eq(ClassesTable.businessId, parsedId))
          .execute();
        return NextResponse.json(classes);
      }
    }

    const classes = await db.select().from(ClassesTable).execute();
    return NextResponse.json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return errorResponse("Failed to fetch classes");
  }
}
