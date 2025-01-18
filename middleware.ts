import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If the user is authenticated, allow them to access any route
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth",
    },
  }
);

export const config = {
  matcher: [
    "/businesses/:path*",
    "/classes/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    // Add other protected routes here
  ],
};
