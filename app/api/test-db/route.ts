import { getUsers } from "lib/db/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }
}
