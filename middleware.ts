import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;

console.log("JWT_SECRET:", JWT_SECRET);

export async function middleware(request: NextRequest) {
  console.log("Middleware called for URL:", request.url);
  console.log("All cookies:", request.cookies.getAll());

  const token = request.cookies.get("token")?.value;

  console.log("Token in middleware:", token);

  if (!token) {
    console.log("No token found, redirecting to /auth");
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jose.jwtVerify(token, secret);
    console.log("Token verified successfully");
    return NextResponse.next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
