import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/auth";
import { OAuth2Client } from "google-auth-library";

const oauth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
);

const userTokens = new Map();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(
      new URL("/calendar?error=auth_error", process.env.NEXTAUTH_URL!)
    );
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/calendar?error=no_code", process.env.NEXTAUTH_URL!)
    );
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    userTokens.set(session.user.id, tokens);
    return NextResponse.redirect(
      new URL("/calendar", process.env.NEXTAUTH_URL!)
    );
  } catch (error) {
    console.error("Error getting tokens:", error);
    return NextResponse.redirect(
      new URL("/calendar?error=auth_error", process.env.NEXTAUTH_URL!)
    );
  }
}
