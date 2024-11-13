import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = [
  "http://localhost:8081",           
  "https://be-well-web.vercel.app", 
  "http://localhost:3000"
];

export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    // Handle OPTIONS request for CORS preflight
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const origin = request.headers.get("origin");
    const isAllowedOrigin = allowedOrigins.includes(origin || "");

    // Add CORS headers to the response
    const response = NextResponse.next();
    //response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Origin", isAllowedOrigin ? origin || "" : "");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return response;
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: "/api/:path*",
};
