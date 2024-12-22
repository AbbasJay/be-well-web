import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ isAuthenticated: false });
    }

    const user = await getUserFromToken(token);
    return NextResponse.json({ isAuthenticated: !!user });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ isAuthenticated: false });
  }
}
