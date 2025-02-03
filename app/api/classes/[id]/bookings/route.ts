import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { BookingsTable, UsersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const classId = parseInt(params.id);
    if (isNaN(classId)) {
      return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
    }

    const bookings = await db
      .select({
        booking: BookingsTable,
        user: {
          id: UsersTable.id,
          name: UsersTable.name,
          email: UsersTable.email,
        },
      })
      .from(BookingsTable)
      .innerJoin(UsersTable, eq(BookingsTable.userId, UsersTable.id))
      .where(eq(BookingsTable.classId, classId))
      .orderBy(BookingsTable.createdAt);

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
