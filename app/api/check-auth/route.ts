import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ isAuthenticated: false });
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jose.jwtVerify(token, secret);
    return NextResponse.json({ isAuthenticated: true });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ isAuthenticated: false });
  }
}
