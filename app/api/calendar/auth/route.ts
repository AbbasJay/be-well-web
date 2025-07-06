import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { OAuth2Client } from "google-auth-library";
import { cookies } from "next/headers";

const oauth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const cookieStore = cookies();
  const tokensCookie = cookieStore.get(
    `google_calendar_tokens_${session.user.id}`
  );
  const existingTokens = tokensCookie ? JSON.parse(tokensCookie.value) : null;

  if (existingTokens?.access_token) {
    // Check if token is expired
    const now = Date.now();
    if (existingTokens.expiry_date && now < existingTokens.expiry_date) {
      return NextResponse.json({ access_token: existingTokens.access_token });
    }

    // Token is expired, try to refresh it
    if (existingTokens.refresh_token) {
      try {
        console.log("Attempting to refresh expired token");
        oauth2Client.setCredentials({
          refresh_token: existingTokens.refresh_token,
        });
        const { credentials } = await oauth2Client.refreshAccessToken();
        console.log("Token refresh successful");

        // Update stored tokens in cookie
        const newTokens = {
          access_token: credentials.access_token,
          refresh_token:
            credentials.refresh_token || existingTokens.refresh_token,
          expiry_date: credentials.expiry_date,
        };

        cookieStore.set(
          `google_calendar_tokens_${session.user.id}`,
          JSON.stringify(newTokens),
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 30 * 24 * 60 * 60, // 30 days
          }
        );

        return NextResponse.json({ access_token: credentials.access_token });
      } catch (error) {
        console.error("Failed to refresh token:", error);
        cookieStore.delete(`google_calendar_tokens_${session.user.id}`);
      }
    }
  }

  const origin = new URL(request.url).origin;
  const urlObj = new URL(request.url);
  const redirectParam = urlObj.searchParams.get("redirect");
  const redirectUri = `${origin}/api/calendar/auth/callback`;

  const oauth2ClientWithRedirect = new OAuth2Client(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const authUrl = oauth2ClientWithRedirect.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
    prompt: "consent",
    redirect_uri: redirectUri,
    state: redirectParam || undefined,
  });

  return NextResponse.json({ url: authUrl });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const cookieStore = cookies();
  const tokensCookie = cookieStore.get(
    `google_calendar_tokens_${session.user.id}`
  );
  const existingTokens = tokensCookie ? JSON.parse(tokensCookie.value) : null;

  if (!existingTokens) {
    return NextResponse.json({ error: "No tokens found" }, { status: 404 });
  }

  return NextResponse.json({ access_token: existingTokens.access_token });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const cookieStore = cookies();
  cookieStore.delete(`google_calendar_tokens_${session.user.id}`);
  return NextResponse.json({ success: true });
}
