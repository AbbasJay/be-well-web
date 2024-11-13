import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/db";
import { Business, BusinessesTable } from "@/lib/db/schema";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
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

    const body: Omit<Business, "userId"> = await req.json();
    const businessData: Business = { ...body, userId: user.id };

    await db.insert(BusinessesTable).values(businessData).execute();
    return NextResponse.json(
      { message: "Business added successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error inserting business:", error);
    return NextResponse.json(
      {
        error: "Failed to add business",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const all = url.searchParams.get("all");

    if (all === "true") {
      const businesses = await db.select().from(BusinessesTable).execute();
      return NextResponse.json(businesses, { status: 200 });
    }

    // Get token
    const headerToken = req.headers
      .get("Authorization")
      ?.replace("Bearer ", "");
    const cookieStore = cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const token = headerToken || cookieToken;

    // Handle no authentication
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user from token
    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    // Get businesses for the authenticated user
    const businesses = await db
      .select()
      .from(BusinessesTable)
      .where(eq(BusinessesTable.userId, user.id))
      .execute();

    return NextResponse.json(businesses);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
