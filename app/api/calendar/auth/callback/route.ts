import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/auth";
import { OAuth2Client } from "google-auth-library";
import { cookies } from "next/headers";

const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

function getBaseUrl(request: Request) {
  const host = request.headers.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return process.env.NODE_ENV === "production"
    ? process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://be-well-web.vercel.app"
    : process.env.NEXTAUTH_URL || "http://localhost:3000";
}

const oauth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

export async function GET(request: Request) {
  const BASE_URL = getBaseUrl(request);
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error("No session found in callback");
    const redirectUrl = new URL("/calendar", BASE_URL);
    redirectUrl.searchParams.set("error", "auth_error");
    return NextResponse.redirect(redirectUrl);
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    console.error("Google OAuth error:", error);
    const redirectUrl = new URL("/calendar", BASE_URL);
    redirectUrl.searchParams.set("error", error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    console.error("No code received in callback");
    const redirectUrl = new URL("/calendar", BASE_URL);
    redirectUrl.searchParams.set("error", "no_code");
    return NextResponse.redirect(redirectUrl);
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

    const redirectUrl = new URL("/calendar", BASE_URL);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error getting tokens:", error);
    const redirectUrl = new URL("/calendar", BASE_URL);
    redirectUrl.searchParams.set("error", "token_error");
    return NextResponse.redirect(redirectUrl);
  }
}
