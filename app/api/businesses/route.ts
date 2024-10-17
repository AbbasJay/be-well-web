import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { BusinessesTable, Business } from "@/lib/db/schema";
import { getUserFromToken } from "@/lib/auth";
import { cookies } from "next/headers";

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

    // Parse the request body
    const body: Omit<Business, "userId"> = await req.json();

    console.log("Received business data:", body); // Debugging line

    // Include userId in the business data
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
