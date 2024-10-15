import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token && !request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (token) {
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/check-auth`, {
        headers: {
          Cookie: `token=${token}`,
        },
      });
      const data = await response.json();

      if (
        !data.isAuthenticated &&
        !request.nextUrl.pathname.startsWith("/auth")
      ) {
        return NextResponse.redirect(new URL("/auth", request.url));
      }
    } catch (error) {
      console.error("Error in middleware:", error);
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
