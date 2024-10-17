import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { BusinessesTable } from "@/lib/db/schema";
import { getUserFromToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const businessId = parseInt(params.id);

    // Combine conditions using 'and'
    const business = await db
      .select()
      .from(BusinessesTable)
      .where(
        and(
          eq(BusinessesTable.id, businessId),
          eq(BusinessesTable.userId, user.id)
        )
      )
      .execute();

    if (!business.length) {
      return NextResponse.json(
        { error: "Business not found or not authorized" },
        { status: 404 }
      );
    }

    // Delete the business
    await db
      .delete(BusinessesTable)
      .where(eq(BusinessesTable.id, businessId))
      .execute();

    return NextResponse.json(
      { message: "Business deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting business:", error);
    return NextResponse.json(
      {
        error: "Failed to delete business",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = parseInt(params.id);

    const business = await db
      .select()
      .from(BusinessesTable)
      .where(eq(BusinessesTable.id, businessId))
      .execute();

    if (!business.length) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(business[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      { error: "Failed to fetch business" },
      { status: 500 }
    );
  }
}
