import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { Business, BusinessesTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = parseInt(params.id);
    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: "Invalid business ID" },
        { status: 400 }
      );
    }

    // Check if business exists and belongs to user
    const business = await db
      .select()
      .from(BusinessesTable)
      .where(
        and(
          eq(BusinessesTable.id, businessId),
          eq(BusinessesTable.userId, parseInt(session.user.id))
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
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = parseInt(params.id);
    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: "Invalid business ID" },
        { status: 400 }
      );
    }

    const [business] = await db
      .select()
      .from(BusinessesTable)
      .where(
        and(
          eq(BusinessesTable.id, businessId),
          eq(BusinessesTable.userId, parseInt(session.user.id))
        )
      )
      .execute();

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(business, { status: 200 });
  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      { error: "Failed to fetch business" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = parseInt(params.id);
    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: "Invalid business ID" },
        { status: 400 }
      );
    }

    // Check if business exists and belongs to user
    const existingBusiness = await db
      .select()
      .from(BusinessesTable)
      .where(
        and(
          eq(BusinessesTable.id, businessId),
          eq(BusinessesTable.userId, parseInt(session.user.id))
        )
      )
      .execute();

    if (!existingBusiness.length) {
      return NextResponse.json(
        { error: "Business not found or not authorized" },
        { status: 404 }
      );
    }

    const body: Partial<Business> = await req.json();

    // TODO HERE: validation

    // update db
    await db
      .update(BusinessesTable)
      .set(body)
      .where(eq(BusinessesTable.id, businessId))
      .execute();

    return NextResponse.json(
      { message: "Business updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json(
      {
        error: "Failed to update business",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
