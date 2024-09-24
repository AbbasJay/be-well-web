import { NextResponse } from "next/server";
import { db } from "lib/db/db";
import { UsersTable } from "lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // In a real application, you would hash the password and compare it with the stored hash
    const user = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.email, email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Here you would compare the password with the hashed password in the database
    // For now, we'll just return the user if the email exists
    return NextResponse.json(user[0], { status: 200 });
  } catch (error) {
    console.error("Error in login route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
