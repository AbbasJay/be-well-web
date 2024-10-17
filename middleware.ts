import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only run this middleware on the /auth page
  if (pathname === "/auth") {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (token) {
      try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        await jose.jwtVerify(token, secret);

        // If the token is valid, redirect to the homepage
        return NextResponse.redirect(new URL("/", req.url));
      } catch (error) {
        console.error("Error verifying token:", error);
        // If token verification fails, allow access to the /auth page
      }
    }
  }

  // Continue to the requested page if not redirecting
  return NextResponse.next();
}

export const config = {
  matcher: ["/auth"], // Apply middleware only to the /auth page
};
