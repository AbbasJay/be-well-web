import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/auth";
import { OAuth2Client } from "google-auth-library";
import { cookies } from "next/headers";

const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

const oauth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error("No session found in callback");
    return NextResponse.redirect(
      new URL("/calendar?error=auth_error", process.env.NEXTAUTH_URL!)
    );
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(
      new URL(`/calendar?error=${error}`, process.env.NEXTAUTH_URL!)
    );
  }

  if (!code) {
    console.error("No code received in callback");
    return NextResponse.redirect(
      new URL("/calendar?error=no_code", process.env.NEXTAUTH_URL!)
    );
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    // Store tokens in cookie
    const cookieStore = cookies();
    cookieStore.set(
      `google_calendar_tokens_${session.user.id}`,
      JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      }
    );

    return NextResponse.redirect(
      new URL("/calendar", process.env.NEXTAUTH_URL!)
    );
  } catch (error: any) {
    console.error("Error getting tokens:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });
    return NextResponse.redirect(
      new URL("/calendar?error=token_error", process.env.NEXTAUTH_URL!)
    );
  }
}
